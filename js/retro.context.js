"use strict";

/**
 * Context object for canvas emulating retro-style graphics.
 *
 * @example
 * // A retro context is obtained this way:
 * var context = canvas.getContext('retro');
 *
 * // The canvas can be set up with native resolution using data-* attributes.
 * // Here width and height will be the on-screen size and the data-* represents the
 * // internal retro resolution. You can also set size later by using the
 * // [resolution()]{@link Context#resolution} method.
 *
 * &lt;canvas id="myId" width=960 height=600 data-width=320 data-height=200&gt;&lt;/canvas&gt;
 *
 * @class Context
 * @param {HTMLCanvasElement} dstCanvas - On-screen canvas
 * @returns {Context}
 * @constructor
 * @property {CanvasRenderingContext2D} context - Context used for internal (actual drawing surface)
 */
retro.Context = function(dstCanvas) {

	var	me				= this,

		rw				= dstCanvas.dataset.width || dstCanvas.width,
		rh				= dstCanvas.dataset.height || dstCanvas.height,

		canvas			= document.createElement('canvas'),				// off-screen canvas at actual resolution
		ctx				= canvas.getContext('2d', {'alpha': false}),	// context for off-screen

		ncanvas			= document.createElement('canvas'),				// off-screen temporary canvas for native operations
		nctx			= ncanvas.getContext('2d', {'alpha': false}),	// used as copy-source

		dctx,															// dest. context
		idata, buffer, buffer32,										// image data and 8 + 32 bit buffers
		resX, resY,														// off-screen resolution

		scaleX,															// relationship between internal and on-screen canvas
		scaleY,
		autoCommit		= true,											// auto commit pixels to main canvas
		safeMode		= true,											// disable pixel clipping

		penColor,														// current pen color as integer
		fillColor,														// current fill color as integer
		bgColor,
		penIndex		= -1,											// set to indexes if index were used
		fillIndex		= -1,
		bgIndex			= -1,
		fillCSS			= 'rgba(0,0,0,0)',								// for native methods

		prevFontPen		= null,											// for text() for optimization

		xorMode			= false,										// draw operations in xor mode
		xorMask,
		onMask,

		fonts			= [],											// font array of font object
		currentFont		= null,											// current font object
		textAlign		= 'left',
		textBaseline	= 'top',

		currentPalette	= null,											// color palette
		lut,															// cache LUT of palette

		translateX = 0,
		translateY = 0,

		rgb2int,														// function reference based on byte-order
		int2rgb,

		setPixel		= _setPixel,
		setPixelFill	= _setPixelFill
		;

	/********************************************************************
	*																	*
	*	Setup CONTEXT													*
	*																	*
	********************************************************************/

	rw = ((rw / 8)|0) * 8;

	if (rw < 8 || rh < 1)
		throw 'Invalid resolution.';

	scaleX			= rw / dstCanvas.width;
	scaleY			= rh / dstCanvas.height;

	canvas.width	= rw;
	canvas.height	= rh;

	ncanvas.width	= rw;
	ncanvas.height	= rh;

	initEndian();
	initCanvas();

	dstCanvas.addEventListener('resize', initCanvas, false);

	resX = canvas.width;
	resY = canvas.height;

	this.context = ctx;

	/********************************************************************
	 *																	*
	 *	SETUP AND BEHAVIOR												*
	 *																	*
	 ********************************************************************/

	/**
	 *	Sets up the on-screen canvas and redraws the graphics, Use this
	 *	if you need to change the on-screen canvas' size for some reason
	 *	or its content is cleared by other reasons (for example window
	 *	resize in some browsers).
	 *
	 * @returns {Context}
	 */
	this.initCanvas = function() {
		initCanvas();
		commit();
		return this;
	};

	/**
	 * Set the internal resolution of retro canvas. The internal
	 * canvas is scaled to fit the on-screen canvas. For best results
	 * use sizes that are multiplies of 1x, 2x, 3x etc. of the resolution
	 * given here for the on-screen canvas.
	 *
	 * Although there is no upper limit we do not recommend larger
	 * resolutions than 640 x 400 for animated content.
	 *
	 * Width has to be divisible by 8.
	 *
	 * Note: changing resolution will clear its existing content.
	 *
	 * @param {Number} [w] width of retro screen.
	 * @param {Number} [h] height of retro screen.
	 * @returns {Context|{width: Number, height: Number}} If no arguments are given the current resolution
	 * is returned as an object with properties width and height.
	 */
	this.resolution = function(w, h) {

		if (arguments.length === 0)
			return {
				width	: resX,
				height	: resY
			};

		if (resX < 1 || resY < 1)
			throw 'Invalid resolution.';

		resX = ((w / 8)|0) * 8;
		resY = h|0;

		canvas.width = resX;
		canvas.height = resY;

		ncanvas.width = resX;
		ncanvas.height = resY;

		scaleX = resX / dstCanvas.width;
		scaleY = resY / dstCanvas.height;

		getBuffers(resX, resY, false);
		commit();

		return this;
	};

	/**
	 * Commits changes to the internal buffer and updates the on-screen
	 * canvas. Use this is you have disabled
	 * [autoCommit()]{@link Context#autoCommit}
	 *
	 * Set rebuffer flag to true if you have used native methods on the
	 * context to update the internal buffers.
	 *
	 * @param {Boolean} [rebuffer=False] Include native drawn graphics
	 * @returns {Context}
	 */
	this.commit = function(rebuffer) {
		rebuffer = isBool(rebuffer) ? rebuffer : false;
		commit(rebuffer);
		return this;
	};

	/**
	 * Setting autoCommit to false will require you to update the screen
	 * manually using [commit()]{@link Context#commit}.
	 * This is useful when drawing many objects to the screen
	 * intended to be updated once at the same time.
	 *
	 * @param {Boolean} [mode=true] Enable or disabled auto-committing
	 * @returns {Context|Boolean} If no argument is given current mode is returned.
	 */
	this.autoCommit = function(mode) {

		if (!isBool(mode))
			return autoCommit;

		autoCommit = mode;

		return this;
	};

	/**
	 * Enables or disables boundary checks for internal pixel setting.
	 * Pixels beyond boundaries will wrap around if disabled and outside
	 * visible area.
	 *
	 * The purpose of this method is to allow reduction of a small
	 * overhead (although microscopic) from boundary checking the
	 * pixel's position and in some cases gain a small performance
	 * boost (when disabled).
	 *
	 * @param {Boolean} [mode=True] Enable or disable boundary checks
	 * @returns {Context|Boolean} If no argument is given current mode is returned.
	 */
	this.safeMode = function(mode) {

		if (!isBool(mode))
			return safeMode;

		setPixel = mode ? _setPixel : _setPixelFast;

		this.setPixel = setPixel;

		safeMode = mode;

		return this;
	};

	/********************************************************************
	 *																	*
	 *	LOW-LEVEL BUFFERS												*
	 *																	*
	 ********************************************************************/

	/**
	 * Get raw pixel buffer of the internal buffer.
	 *
	 * The parameters are optional. If no arguments are given
	 * the current in-use ImageData object is returned instead of a
	 * new at the size of the retro resolution.
	 *
	 * @param {Number} [x] start position x
	 * @param {Number} [y] start position y
	 * @param {Number} [w] width of region
	 * @param {Number} [h] height of region
	 * @returns {ImageData} ImageData object
	 */
	this.getImageData = function(x, y, w,h) {

		if (arguments.length === 0)
			return idata;

		return ctx.getImageData(x, y, w, h);
	};

	/**
	 * Put pixels from an ImageData object onto the internal buffer.
	 * If no arguments are given the internal object is replaced
	 * instead of copied.
	 *
	 * @param {ImageData} [newData] ImageData object
	 * @param {Number} [x] start position x
	 * @param {Number} [y] start position y
	 * @returns {Context}
	 */
	this.putImageData = function(newData, x, y) {

		if (arguments.length === 0) {
			idata = newData;
			if (autoCommit) commit();

		}
		else {
			ctx.putImageData(idata, x, y);
			if (autoCommit) commit(true);
		}

		return this;
	};

	/**
	 * Returns a data-uri of the internal screen with background color set
	 * as a solid background (see [bgColor()]{@link Context#bgColor}.
	 *
	 * Not to be confused with the on-screen canvas which has its own
	 * standard toDataURL() method. Use this if you want the original
	 * image with solid background at its native resolution.
	 *
	 * Use the on-screen canvas' method if you want a snapshot of the
	 * on-screen image, but note that if background is not filled using
	 * [fillBackground()]{@link Context#fillBackground} it will be
	 * transparent regardless of [bgColor()]{@link Context#bgColor}.
	 *
	 * Note: This call will commit even if
	 * [autoCommit]{@link Context#autoCommit} is disabled.
	 *
	 * @param {String} [type] - mime type (defaults to image/png)
	 * @param {Number} [quality] - quality setting (useful for image/jpeg)
	 * @returns {String} Data-uri with image encoded as base-64
	 */
	this.toDataURL = function(type, quality) {

		var c = document.createElement('canvas'),
			ctx = c.getContext('2d'),
			res = this.resolution(),
			col;

		c.width = res.width;
		c.height = res.height;

		commit(true);

		if (bgColor) {
			col = int2rgb(bgColor);
			ctx.fillStyle = (new retro.Color(col[0], col[1], col[2])).toStyle();
			ctx.fillRect(0, 0, res.width, res.height);
		}

		ctx.drawImage(canvas, 0, 0);

		return ctx.canvas.toDataURL.apply(ctx.canvas, arguments);
	};

	/**
	 *	Redraws a specific region to on-screen canvas. The source
	 *	content must already be committed.
	 *
	 * @param {Number} x - start position x
	 * @param {Number} y - start position y
	 * @param {Number} w - width of area to update
	 * @param {Number} h - height of area to update
	 * @returns {Context}
	 */
	this.updateRegion = function(x, y, w, h) {

		var sx = dstCanvas.width / resX,
			sy = dstCanvas.height / resY,
			oldMode = dctx.globalCompositeOperation;

		dctx.globalCompositeOperation = 'source-over';
		dctx.drawImage(canvas, x, y, w, h, 	x * sx, y * sy, w * sx, h * sy);
		dctx.globalCompositeOperation = oldMode;

		return this;
	};

	/********************************************************************
	*																	*
	*	COLORS															*
	*																	*
	********************************************************************/

	/**
	 * Sets or gets a [Palette]{@link retro.Palette} object or an Array
	 * which allow usage of indexes for
	 * [penColor()]{@link retro.Context#penColor},
	 * [fillColor()]{@link retro.Context#fillColor} and
	 * [bgColor]{@link retro.Context#bgColor} as well
	 * as [drawImage()]{@link retro.Context#drawImage} using
	 * palette mode.
	 *
	 * You can also use name for an internally defined palette (see
	 * [retro.Palette]{@link retro.Palette} for details.
	 *
	 * If array it mst be ordered as either:
	 * <code>[ [r0, g0, b0], [r1, g1, b1], ...]</code> or as an array of
	 * [retro.Color]{@link retro.Color} instances.
	 *
	 * Use null to remove a set palette.
	 *
	 * @param {?retro.Palette|Array|String} [palette] palette object, array or null
	 * @returns {retro.Palette|Context} If no argument is given it
	 * will return current palette or null if none is set.
	 */
	this.palette = function(palette) {

		if (arguments.length === 0)
			return currentPalette;

		if (palette instanceof retro.Palette) {
			currentPalette = palette;
			lut = palette.lut;
		}
		else if (Array.isArray(palette) || isStr(palette)) {
			palette = new retro.Palette(palette);
			currentPalette = palette;
			lut = palette.lut;

		}
		else {
			currentPalette = lut = null;
		}

		return this;
	};

	/**
	 * Sets a pen color based on a RGB value or a retro.Color object.
	 * Use null to make pen transparent.
	 *
	 * If no arguments are given it will return an object with current
	 * RGB values.
	 *
	 * @param {(?Number|retro.Color)} [r] red or retro.Color
	 * @param {Number} [g] green
	 * @param {Number} [b] blue
	 * @returns {Context|retro.Color} If no arguments are given
	 * the current color is returned as retro.Color or null if not used.
	 */
	this.penColor = function(r, g, b) {

		var c;

		if (arguments.length === 0) {

			if (penColor === null) {
				return null;
			}
			else {
				c = int2rgb(penColor);
				return new retro.Color(c[0], c[1], c[2]);
			}

		}
		else if (arguments.length === 3) {
			penColor = rgb2int(r, g, b);
		}
		else {

			if (r instanceof retro.Color) {
				penColor = r.toInt();
			}
			else {
				penColor = null;
			}
		}

		penIndex = -1;

		return this;
	};

	/**
	 * If a palette is set a color based on its index within the range
	 * of the palette.
	 *
	 * @param {Number} [index] Index number in palette LUT
	 * @returns {Number|Context} - If no argument is given it returns current index or -1
	 */
	this.penIndex = function(index) {

		if (arguments.length === 0)
			return penIndex;

		if (currentPalette) {
			if (index < 0) {
				penColor = null;
				penIndex = -1;
			}
			else {
				penColor = currentPalette._lutCache[index];
				penIndex = index;
			}
		}

		return this;
	};

	/**
	 * Sets a fill color based on a RGB value or, if palette is set, an
	 * index value within the range of the palette. Use null to
	 * make fill transparent.
	 *
	 * If no arguments are given it will return an object with current
	 * RGBA values. Use the alpha value to determine if fill is in use.
	 *
	 * @param {?Number|retro.Color} [r] red or index or retro.Color
	 * @param {Number} [g] green
	 * @param {Number} [b] blue
	 * @returns {Context|retro.Color} If no arguments are given
	 * the current color is returned as retro.Color or null if not used.
	 */
	this.fillColor = function(r, g, b) {

		var c;

		if (arguments.length === 0) {

			if (fillColor === null) {
				return null;
			}
			else {
				c = int2rgb(fillColor);
				return new retro.Color(c[0], c[1], c[2]);
			}

		}
		else if (arguments.length === 3) {
			fillColor = rgb2int(r, g, b);
			fillCSS = 'rgb(' + r + ',' + g + ',' + b + ')';
		}
		else {

			if (r instanceof retro.Color) {
				fillColor = r.toInt();
				fillCSS = 'rgb(' + r.r + ',' + r.g + ',' + r.b + ')';
			}
			else {
				fillColor = null;
			}
		}

		fillIndex = -1;

		return this;
	};

	/**
	 * If a palette is set a fill color based on its index within the range
	 * of the palette.
	 *
	 * @param {Number} [index] Index number in palette LUT
	 * @returns {Number|Context} - If no argument is given it returns current index or -1
	 */
	this.fillIndex = function(index) {

		var c;

		if (arguments.length === 0)
			return fillIndex;

		if (currentPalette) {
			if (index < 0) {
				fillColor = null;
				fillIndex = -1;
				fillCSS = 'transparent';
			}
			else {
				fillColor = currentPalette._lutCache[index];
				fillIndex = index;
				c = currentPalette.lut[index];
				fillCSS = 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
			}
		}

		return this;
	};

	/**
	 * Sets a bg color based on a RGB value or, if palette is set, an
	 * index value within the range of the PALETTE. Use null to
	 * make background of canvas transparent.
	 *
	 * If no arguments are given it will return an object with current
	 * RGBA values. Use the alpha value to determine if bgColor is in use.
	 *
	 * NOTE: This method is special as it sets the color on the canvas
	 * element itself and does not fill the bitmap. To actually fill
	 * the bitmap use [fillBackground()]{@link retro.Context#fillBackground}
	 * or to clear it use [clear()]{@link retro.Context#clear}.
	 *
	 * @param {?Number|retro.Color} [r] red or index or retro.Color. If Color then g and b are not given.
	 * @param {Number} [g] green
	 * @param {Number} [b] blue
	 * @returns {Context|retro.Color} If no arguments are given
	 * the current color is returned as retro.Color or null if not used.
	 */
	this.bgColor = function(r, g, b) {

		var c, cs;

		if (arguments.length === 0) {

			if (bgColor === null) {
				return null;
			}
			else {
				c = int2rgb(bgColor);
				return new retro.Color(c[0], c[1], c[2]);
			}

		}
		else if (arguments.length === 3) {
			bgColor = rgb2int(r, g, b);
		}
		else {

			if (r instanceof retro.Color) {
				bgColor = r.toInt();
			}
			else {
				bgColor = null;
			}
		}

		bgIndex = -1;

		if (bgColor !== null) {
			c = int2rgb(bgColor);
			cs = 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
		}
		else {
			cs = 'transparent';
		}

		dstCanvas.style.backgroundColor = cs;

		return this;

	};

	/**
	 * If a palette is set a background color based on its index within
	 * the range of the palette.
	 *
	 * @param {Number} [index] Index number in palette LUT
	 * @returns {Number|Context} - If no argument is given it returns current index or -1
	 */
	this.bgIndex = function(index) {

		var c, cs;

		if (arguments.length === 0)
			return bgIndex;

		if (currentPalette) {
			if (index < 0) {
				bgColor = null;
				bgIndex = -1;
				cs = 'transparent';
			}
			else {
				bgColor = currentPalette._lutCache[index];
				bgIndex = index;
				c = currentPalette.lut[index];
				cs = 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
			}
		}

		dstCanvas.style.backgroundColor = cs;

		return this;
	};

	/**
	 *	Clears the retro canvas and updates it to display canvas.
	 *	This will also clear the background making the on-screen canvas
	 *	transparent.
	 *
	 * @returns {Context}
	 */
	this.clear = function() {

		//TODO Use a min/max approach
		//- each method calcs global min/max for the operation
		//- some (ie. fillBackground) resets the min/max (minX = -1)
		//- if minX = -1, clear all, else clear only region

		getBuffers(resX, resY, false);

		if (autoCommit) commit();

		return this;
	};

	/**
	 *	Clears a rectangular area with transparent color.
	 *
	 * @param {Number} x - start x
	 * @param {Number} y - start y
	 * @param {Number} w - width (inclusive)
	 * @param {Number} h - height (inclusive)
	 * @returns {Context}
	 */
	this.clearRect = function(x, y, w, h) {

		x += translateX;
		y += translateY;

		//TODO check bounds

		var sx,
			sy = y,
			x2 = x + w,
			y2 = ((h * 0.5)|0) * 2 + sy,
			ey = y + h,
			p, px;

		for (; sy < y2; sy += 2) {
			p = sy * resX;
			px = p + resX;
			for(sx = x; sx < x2; sx++) {
				buffer32[p + sx] = 0;
				buffer32[px + sx] = 0;
			}
		}

		if (sy < ey) {
			p = sy * resX;
			for(sx = x; sx < x2; sx++) {
				buffer32[p + sx] = 0;
			}
		}

		if (autoCommit) commit();

		return this;
	};

	/*
	Experiment - traditional approach: turns out to be 4x slower than local fill...
	function fill(x, y, w, h, col) {

		if (x < 0) {
			w += x;
			x = 0;
		}

		if (y < 0) {
			h += y;
			y = 0;
		}

		if (x + w > resX) w = resX - x;
		if (y + h > resY) h = resY - y;

		if (w < 1 || h < 1) return;

		var sy, sx,
			ey = y + h,
			ex = x + w,
			w8 = (w >> 3) << 3, // LSB mode
			diff = w - w8,
			ex8 = x + w8,
			p, px;

		if (w8 > 0) {
			for(sy = y; sy < ey; sy++) {
				p = sy * resX;
				for(sx = x; sx < ex8; sx += 8) {
					px = p + sx;
					buffer32[px] = col;
					buffer32[px + 1] = col;
					buffer32[px + 2] = col;
					buffer32[px + 3] = col;
					buffer32[px + 4] = col;
					buffer32[px + 5] = col;
					buffer32[px + 6] = col;
					buffer32[px + 7] = col;
				}
			}
		}

		if (diff > 0) {
			if (diff === 1) {
				for(sy = y; sy < ey; sy++) {
					buffer32[sy * resX + ex8] = col;
				}
			}
			else if (diff === 2) {
				p = y * resX + ex8;
				for(sy = y; sy < ey; sy++, p += resX) {
					buffer32[p] = col;
					buffer32[p + 1] = col;
				}
			}
			else if (diff === 3) {
				p = y * resX + ex8;
				for(sy = y; sy < ey; sy++, p += resX) {
					buffer32[p] = col;
					buffer32[p + 1] = col;
					buffer32[p + 2] = col;
				}
			}
			else if (diff === 4) {
				p = y * resX + ex8;
				for(sy = y; sy < ey; sy++, p += resX) {
					buffer32[p] = col;
					buffer32[p + 1] = col;
					buffer32[p + 2] = col;
					buffer32[p + 3] = col;
				}
			}
			else if (diff === 5) {
				p = y * resX + ex8;
				for(sy = y; sy < ey; sy++,p += resX) {
					buffer32[p] = col;
					buffer32[p + 1] = col;
					buffer32[p + 2] = col;
					buffer32[p + 3] = col;
					buffer32[p + 4] = col;
				}
			}
			else if (diff === 6) {
				p = y * resX + ex8;
				for(sy = y; sy < ey; sy++, p += resX) {
					buffer32[p] = col;
					buffer32[p + 1] = col;
					buffer32[p + 2] = col;
					buffer32[p + 3] = col;
					buffer32[p + 4] = col;
					buffer32[p + 5] = col;
				}
			}
			else {
				p = y * resX + ex8;
				for(sy = y; sy < ey; sy++, p += resX) {
					buffer32[p] = col;
					buffer32[p + 1] = col;
					buffer32[p + 2] = col;
					buffer32[p + 3] = col;
					buffer32[p + 4] = col;
					buffer32[p + 5] = col;
					buffer32[p + 6] = col;
				}
			}
		}

	}
	 */

	/**
	 *	Fills the whole canvas with the current [fillColor()]{@link Context#fillColor}.
	 *
	 * @returns {Context}
	 */
	this.fillBackground = function() {

		var i = 0,
			len = buffer32.length;

		for(; i < len; i += 8) {
			buffer32[i] = fillColor;
			buffer32[i+1] = fillColor;
			buffer32[i+2] = fillColor;
			buffer32[i+3] = fillColor;
			buffer32[i+4] = fillColor;
			buffer32[i+5] = fillColor;
			buffer32[i+6] = fillColor;
			buffer32[i+7] = fillColor;
		}

		if (autoCommit) commit();

		return this;
	};

	/**
	 * Replace an existing color given as argument with current
	 * [fillColor()]{@link Context#fillColor}.
	 *
	 * @param {(Number|retro.Color)} r - red or Color object
	 * @param {Number} [g] green
	 * @param {Number} [b] blue
	 * @returns {Context}
	 */
	this.replaceColor = function(r, g, b) {

		var i = 0, c, len, col;

		if (arguments.length === 1) {

			if (r instanceof retro.Color) {
				g = r.g;
				b = r.b;
				r = r.r;
			}
			else if (isNum(r)) {
				c = currentPalette.getColor(r);
				r = c.r;
				g = c.g;
				b = c.b;
			}
			else {

				//TODO replace with image

			}
		}

		// Iterate buffer and replace
		len = buffer32.length;
		col = rgb2int(r, g, b);

		for(; i < len; i += 8) {
			if (buffer32[i] === col) buffer32[i] = fillColor;
			if (buffer32[i+1] === col) buffer32[i+1] = fillColor;
			if (buffer32[i+2] === col) buffer32[i+2] = fillColor;
			if (buffer32[i+3] === col) buffer32[i+3] = fillColor;
			if (buffer32[i+4] === col) buffer32[i+4] = fillColor;
			if (buffer32[i+5] === col) buffer32[i+5] = fillColor;
			if (buffer32[i+6] === col) buffer32[i+6] = fillColor;
			if (buffer32[i+7] === col) buffer32[i+7] = fillColor;
		}

		if (autoCommit) commit();

		return this;
	};

	/********************************************************************
	*																	*
	*	GRAPHICS IMPLEMENTATIONS										*
	*																	*
	********************************************************************/

	/*******************************************************************
	 *	Faster Bresenham line implementation to draw aliased lines.
	 *	Arguments must be integer values.
	*/
/*	this.line = function (x1, y1, x2, y2, int) {

		int = int || false;

		if (x1 === x2) {
			vl(x1, Math.min(y1, y2), Math.abs(y2 - y1) + 1);
			if (!int) commit();
			return this;
		}

		if (y1 === y2) {
			hl(Math.min(x1, x2), y1, Math.abs(x2 - x1) + 1);
			if (!int) commit();
			return this;
		}

		var dx = Math.abs(x2 - x1), sx = x1 < x2 ? 1 : -1,
			dy = Math.abs(y2 - y1), sy = y1 < y2 ? 1 : -1,
			err = (dx > dy ? dx : -dy) * 0.5;

		while(!0) {

			setPixel(x1, y1);

			if (x1 === x2 && y1 === y2) break;

			var e2 = err;
			if (e2 > -dx) { err -= dy; x1 += sx; }
			if (e2 < dy)  { err += dx; y1 += sy; }
		}

		if (!int) commit();

		function hl(x, y, w) {
			while(w--) setPixel(x + w, y);
		}

		function vl(x, y, w) {
			while(w--) setPixel(x, y + w);
		}

		return this;
	}
*/

	/**
	 * Draw an one pixel thick line with current
	 * [penColor()]{@link Context#penColor} between
	 * start and end points. End point is inclusive.
	 *
	 * @param {Number} x1 - start position x
	 * @param {Number} y1 - start position y
	 * @param {Number} x2 - end position x
	 * @param {Number} y2 - end position y
	 * @returns {Context}
	 */
	this.line = function(x1, y1, x2, y2) {

		x1 |= 0;
		x2 |= 0;
		y1 |= 0;
		y2 |= 0;

		var
			dlt,
			mul,
			sl = y2 - y1,
			ll = x2 - x1,
			yl = false,
			//lls = retro._isLSB ? ll >> 31 : ll << 31,
			//sls = retro._isLSB ? sl >> 31 : sl << 31,
			lls = ll >> 31,
			sls = sl >> 31,
			i;

		if ((sl ^ sls) - sls > (ll ^ lls) - lls) {
			sl ^= ll;
			ll ^= sl;
			sl ^= ll;
			yl = true;
		}

		dlt = ll < 0 ? -1 : 1;
		mul = (ll === 0) ? sl : sl / ll;

		if (yl) {
			x1 += 0.5;
			for (i = 0; i !== ll; i += dlt)
				setPixel((x1 + i * mul)|0, y1 + i);
		}
		else {
			y1 += 0.5;
			for (i = 0; i !== ll; i += dlt)
				setPixel(x1 + i, (y1 + i * mul)|0);
		}

		setPixel(x2, y2);	/// sets last pixel

		if (autoCommit) commit();

		return this;
	};

	/**
	 * Renders a point array as connected lines. The array must be
	 * arranged like:
	 *
	 * <code>[x1, y1, x2, y2, ... xn, yn]</code>
	 *
	 * Note: All point values must be integer values.
	 *
	 * @param {Array} points - Array with x/y points
	 * @returns {Context}
	 */
	this.lines = function(points) {

		var prevX, prevY, x, y,
			i = 2,
			pl = points.length,
			currentAC = this.autoCommit();

		this.autoCommit(false);

		prevX = points[0];
		prevY = points[1];

		for(; i < pl; i += 2) {
			x = points[i];
			y = points[i + 1];

			me.line(prevX, prevY, x, y);

			prevX = x;
			prevY = y;
		}

		this.autoCommit(currentAC);

		if (autoCommit) commit();

		return this;
	};

	/**
	 * Draw a circle with current [penColor()]{@link Context#penColor}
	 * as outline and optionally current
	 * [fillColor()]{@link Context#fillColor} as fill.
	 *
	 * @param {Number} xc - center x
	 * @param {Number} yc - center y
	 * @param {Number} r - radius
	 * @returns {Context}
	 */
	this.circle = function(xc, yc, r) {

		if (r < 1) return this;

		xc |= 0;
		yc |= 0;
		r  |= 0;

		var x = r,
			y = 0,
			cd = 0,
			xoff = 0,
			yoff = r,
			b = -r,
			p0, p1, w0, w1;

		if (fillColor !== null) {

			while (xoff <= yoff) {
				p0 = xc - xoff;
				p1 = xc - yoff;

				w0 = xoff + xoff;
				w1 = yoff + yoff;

				hl(p0, yc - yoff, yc + yoff, w0);
				hl(p1, yc - xoff, yc + xoff, w1);

				if ((b += xoff++ + xoff) >= 0)
					b -= --yoff + yoff;
			}
		}

		if (penColor === null) {
			if (autoCommit) commit();
			return this;
		}

		setPixel(xc - r, yc);
		setPixel(xc + r, yc);
		setPixel(xc, yc - r);
		setPixel(xc, yc + r);

		while (x > y) {

			cd -= (--x) - (++y);
			if (cd < 0) cd += x++;

			setPixel(xc - x, yc - y);	// upper left left
			setPixel(xc - y, yc - x);	// upper upper left
			setPixel(xc + y, yc - x);	// upper upper right
			setPixel(xc + x, yc - y);	// upper right right
			setPixel(xc - x, yc + y);	// lower left left
			setPixel(xc - y, yc + x);	// lower lower left
			setPixel(xc + y, yc + x);	// lower lower right
			setPixel(xc + x, yc + y);	// lower right right
		}

		if (autoCommit) commit();

		// for fill
		function hl(x, y1, y2, w) {
			w++;
			var xw = 0;
			while(w--) {
				xw = x + w; //TODO this may actually be slower... look-up vs. add
				setPixelFill(xw, y1);
				setPixelFill(xw, y2);
			}
		}

		return this;
	};

	/**
	 * Draws an ellipse from center point with separate radiuses for x
	 * and y axis. The outline is drawn with current
	 * [penColor()]{@link Context#penColor} and
	 * optionally filled with current
	 * [fillColor()]{@link Context#fillColor}.
	 *
	 * All values must be integer values.
	 *
	 * @param {Number} x - center x
	 * @param {Number} y - center y
	 * @param {Number} rx - radius x
	 * @param {Number} ry - radius y
	 * @returns {Context}
	 */
	this.ellipse = function(x, y, rx, ry) {

		rx = (rx|0) - 1;
		ry = (ry|0) - 1;

		if (rx <= 0 || ry <= 0) return this;

		var x1 = x - rx,
			y1 = y - ry,
			x2 = x + rx,
			w = rx << 1,
			h = ry << 1,
			h1 = h & 1,
			dx = ((1 - w) * h * h) << 2,
			dy = ((h1 + 1) * w * w) << 2,
			err = dx + dy + h1 * w * w,
			doFill = (fillColor !== null),
			e2, lw, y2;

		y1 += (h + 1) >> 1;
		y2 = y1 - h1;

		w *= w << 3;
		h1 = (h * h) << 3;

		if (doFill === true) {

			do {
				lw = ((x - x1 + 0.5) * 2 - 2)|0;

				if (lw > 0) {
					hl(x1 + 1, y2, lw);
					hl(x1 + 1, y1, lw);
				}

				setPixel(x2, y1);	// bottom right
				setPixel(x1, y1);	// bottom left
				setPixel(x1, y2);	// top left
				setPixel(x2, y2);	// top right

				e2 = err << 1;

				if (e2 <= dy) {
					y1++;
					y2--;
					err += dy += w;
				}

				if (e2 >= dx || err << 1 > dy) {
					x1++;
					x2--;
					err += dx += h1;
				}

			} while (x1 <= x2);

		}
		else {

			do {
				setPixel(x2, y1);	// bottom right
				setPixel(x1, y1);	// bottom left
				setPixel(x1, y2);	// top left
				setPixel(x2, y2);	// top right

				e2 = err << 1;

				if (e2 <= dy) {
					y1++;
					y2--;
					err += dy += w;
				}

				if (e2 >= dx || err << 1 > dy) {
					x1++;
					x2--;
					err += dx += h1;
				}

			} while (x1 <= x2);
		}

		while (y1 - y2 < h) {
			setPixel(x1 - 1, y1);
			setPixel(x2 + 1, y1++);
			setPixel(x1 - 1, y2);
			setPixel(x2 + 1, y2--);
		}

		if (autoCommit) commit();

		function hl(x, y, w) { while(w--) setPixelFill(x + w, y); }

		return this;
	};

	/**
	 * Draw a rectangle with current
	 * [penColor()]{@link Context#penColor}
	 * as outline and optionally
	 * [fillColor()]{@link Context#fillColor} as fill.
	 *
	 * @param {Number} x - start position x
	 * @param {Number} y - start position y
	 * @param {Number} w - width of rectangle (exclusive)
	 * @param {Number} h - height of rectangle (exclusive)
	 * @returns {Context}
	 */
	this.rect = function(x, y, w, h) {

		x |= 0;
		y |= 0;
		w |= 0;
		h |= 0;

		if (w < 0) {
			x += w;
			w = -w;
		}

		if (h < 0) {
			y += h;
			h = -h;
		}

		w--;
		h--;

		var hy = y + h,
			i;

		if (fillColor !== null) {
			if (penColor) {
				var x1 = x + 1, w2 = w - 1;
				for(i = y + 1; i < hy; i++)
					hlF(x1, i, w2);
			}
			else {
				for(i = y; i <= hy; i++)
					hlF(x, i, w);
			}
			//fill(ox, oy, ow, oh, fillColor); x4 slower !
		}

		if (penColor !== null) {
			hl(x, y, hy, w);
			vl(x, x + w, y, h + 1);
		}

		if (autoCommit) commit();

		function hl(x, y1, y2, w) {
			while(w--) {
				setPixel(x + w, y1);
				setPixel(x + w, y2);
			}
		}

		function vl(x1, x2, y, w) {
			while(w--) {
				setPixel(x1, y + w);
				setPixel(x2, y + w);
			}
		}

		function hlF(x, y, w) { w++; while(w--) setPixelFill(x + w, y); }

		return this;
	};

	/**
	 * Draws a closed polygon from a point array with minimum of three
	 * points. Polygon is self-closing.
	 *
	 * The polygon is outlined with current
	 * [penColor()]{@link Context#penColor}
	 * and optionally filled with current
	 * [fillColor()]{@link Context#fillColor}.
	 *
	 * The points must be arranged in this order:
	 * <pre>[x0, y0, x1, y1, ..., xn, yn]</pre>
	 *
	 * @param {Array} points - Point array
	 * @returns {Context}
	 */
	this.polygon = function(points) {

		var i, //y,
			pts = points.slice(),
			pl = pts.length,
			prevX = pts[0],
			prevY = pts[1];/*,
			minY = 10000,
			maxY = -10000;*/

		if (fillColor !== null) {

			nctx.translate(0.5 + translateX, 0.5 + translateY);
			nctx.fillStyle = fillCSS;
			nctx.moveTo(prevX, prevY);

			for(i = 2; i < pl; i += 2) {
				//y = pts[i+1];
				nctx.lineTo(pts[i], pts[i+1]);
				//if (y < minY) minY = y;
				//if (y > maxY) maxY = y;
			}

			nctx.fill();

			nblitC(fillColor);
			//nblitRng(minY, maxY);	TODO check why this "opt" does not work as intended...
		}

		pts.push(pts[0], pts[1]);

		if (penColor === null) {
			if (autoCommit) commit();
		}
		else {
			this.lines(pts);			// autoCommit check incl.
		}

		return this;
	};

	/**
	 * Draws an arc between start angle and end angle, at radius.
	 * Direction can be reversed setting ccw (counter-clock-wise) to
	 * true.
	 *
	 * All angles are given as radians. All positions in integer values.
	 *
	 * @param {Number} cx - center x
	 * @param {Number} cy - center y
	 * @param {Number} radius - radius
	 * @param {Number} startAngle - start angle in radians
	 * @param {Number} endAngle - end angle in radians
	 * @param {Boolean} [ccw=false] - Counter clock-wise draw
	 * @returns {Context}
	 */
	this.arc = function(cx, cy, radius, startAngle, endAngle, ccw) {

		if (radius === 0 || startAngle === endAngle) return this;

		// switch if start > end
		if (startAngle > endAngle) {
			var tmp = endAngle;
			endAngle = startAngle;
			startAngle = tmp;
		}

		//startAngle %= (2 * Math.PI);
		//endAngle %= (2 * Math.PI);

		ccw = isBool(ccw) ? ccw : false;

		var	step = 0.02, //radius > 140 ? 0.008726646259971648 : 0.017453292519943295,
			pts = [],
			angle = ccw ? endAngle : startAngle,
			sa,
			x, y;

		if (ccw) {
			startAngle = sa = Math.PI * 2 - startAngle;

			for(; angle < startAngle; angle += step) {
				x = (cx + radius * Math.cos(angle) + 0.5)|0;
				y = (cy + radius * Math.sin(angle) + 0.5)|0;
				pts.push(x, y);
			}
		}
		else {
			for(; angle < endAngle + step; angle += step) {
				x = (cx + radius * Math.cos(angle) + 0.5)|0;
				y = (cy + radius * Math.sin(angle) + 0.5)|0;
				pts.push(x, y);
			}
			sa = endAngle;
		}

		// add end point
		x = (cx + radius * Math.cos(sa) + 0.5)|0;
		y = (cy + radius * Math.sin(sa) + 0.5)|0;
		pts.push(x, y);

		this.lines(pts);

		return this;
	};

	/**
	 * Renders a 2. order Bezier curve (quadratic).
	 * Each point is given as an integer value.
	 *
	 * @param {Number} sx - start point x
	 * @param {Number} sy - start point y
	 * @param {Number} cx - control point x
	 * @param {Number} cy - control point y
	 * @param {Number} ex - end point x
	 * @param {Number} ey - end point y
	 * @returns {Context}
	 */
	this.curveQuadratic = function(sx, sy, cx, cy, ex, ey) {

		var pts = [],
			step = 0.025,
			i = step;

		pts.push((sx + 0.5)|0, (sy + 0.5)|0);

		for(; i < 1; i += step) {
			order2(sx, sy, cx, cy, ex, ey, i);
		}

		pts.push((ex + 0.5)|0, (ey + 0.5)|0);

		// B(t) = (1-t)^2 * Z0 + 2(1-t)t * C + t^2 * Z1
		function order2(z0x, z0y, cx, cy, z1x, z1y, t) {

			var t1 = (1 - t),		// (1 - t)
				t12 = t1 * t1,		// (1 - t) ^ 2
				t2 = t * t,			// t ^ 2
				t21tt = 2 * t1 * t, // 2(1-t)t
				x, y;

			x = (t12 * z0x + t21tt * cx + t2 * z1x + 0.5|0);
			y = (t12 * z0y + t21tt * cy + t2 * z1y + 0.5|0);

			pts.push(x, y);
		}

		return this.lines(pts);
	};

	/**
	 * Renders a 3. order Bezier curve.
	 * Each point is given as integer values.
	 *
	 * @param {Number} sx - start point x
	 * @param {Number} sy - start point y
	 * @param {Number} c1x - control point 1 x
	 * @param {Number} c1y - control point 1 y
	 * @param {Number} c2x - control point 2 x
	 * @param {Number} c2y - control point 2 y
	 * @param {Number} ex - end point x
	 * @param {Number} ey - end point y
	 * @returns {Context}
	 */
	this.curveBezier = function(sx, sy, c1x, c1y, c2x, c2y, ex, ey) {

		var pts = [],
			step = 0.025,
			i = step;

		pts.push(sx, sy);

		for(; i < 1; i += step) {
			order3(sx, sy, c1x, c1y, c2x, c2y, ex, ey, i);
		}

		pts.push(ex, ey);

		//B(t) = (1-t)^3 * z0 + 3t (1-t)^2 * c0 + 3 t^2 (1-t) * c1 + t^3 * z1   for 0 <=t <= 1
		function order3(z0x, z0y, c0x, c0y, c1x, c1y, z1x, z1y, t) {

			var tm1 = 1 - t,			// (1 - t)
				tm12 = tm1 * tm1,		// (1 - t) ^ 2
				tm13 = tm12 * tm1,		// (1 - t) ^ 3
				t2 = t * t,				// t ^ 2
				t3 = t2 * t,			// t ^ 3
				tmm3 = t * 3 * tm12,	// 3 x t * (1 - t) ^ 2
				tmm23 = t2 * 3 * tm1,	// t ^ 2 * 3 * (1 - t)
				x, y;

			x = (tm13 * z0x + tmm3 * c0x + tmm23 * c1x + t3 * z1x + 0.5)|0;
			y = (tm13 * z0y + tmm3 * c0y + tmm23 * c1y + t3 * z1y + 0.5)|0;

			pts.push(x, y);
		}

		return this.lines(pts);
	};

	/**
	 * Draws a cardinal (canonical) spline from the given point array. The spline
	 * will pass through the actual points. Set optional tension. The
	 * curve is drawn with current [penColor()]{@link Context#penColor}.
	 *
	 * Note: If [penColor()]{@link Context#penColor} is null nothing will be drawn.
	 *
	 * The points must be arranged in this order and have minimum two
	 * points defined:
	 * <pre>[x0, y0, x1, y1, ..., xn, yn]</pre>
	 *
	 * The tension value is typical in the range [0.0, 1.0] but can
	 * be exceeded to make curly ends. A tension of 0 will generate
	 * straight lines while 1 will make them very "round".
	 *
	 * @param {Array} points - Point array
	 * @param {Number} [tension=0.5] Tension, the higher value the more "round".
	 * @returns {Context}
	 */
	this.curveCardinal = function(points, tension) {

		if (penColor === null)
			return this;

		var pts,					// clone
			x, y,					// our x,y coords
			t1x, t2x, t1y, t2y,		// tension vectors
			c1, c2, c3, c4,			// cardinal points
			st, t, i,				// steps based on num. of segments
			pl = points.length,		// cloned points length
			pow3, pow2,				// cache powers
			pow32, pow23,
			p0, p1, p2, p3,			// cache points

			res = [points[0]|0, points[1]|0],
			numOfSegments = 12;

		// Num of points in result: (points.length - 2) * (numOfSegments + 1) + 2 -> typed array

		tension = tension || 0.5;

		pts = points.slice();	//TODO while loop is currently faster http://jsperf.com/new-array-vs-splice-vs-slice/19

		pts.unshift(points[1]);
		pts.unshift(points[0]);
		pts.push(points[pl - 2], points[pl - 1]);

		for (i = 2; i < pl; i += 2) {

			p0 = pts[i];
			p1 = pts[i + 1];
			p2 = pts[i + 2];
			p3 = pts[i + 3];

			t1x = (p2 - pts[i - 2]) * tension;
			t2x = (pts[i + 4] - p0) * tension;

			t1y = (p3 - pts[i - 1]) * tension;
			t2y = (pts[i + 5] - p1) * tension;

			for(t = 0; t <= numOfSegments; t++) {

				st = t / numOfSegments;

				pow2 = Math.pow(st, 2);
				pow3 = pow2 * st;
				pow23 = pow2 * 3;
				pow32 = pow3 * 2;

				c1 = pow32 - pow23 + 1;
				c2 = pow23 - pow32;
				c3 = pow3 - 2 * pow2 + st;
				c4 = pow3 - pow2;

				x = (c1 * p0 + c2 * p2 + c3 * t1x + c4 * t2x + 0.5)|0;
				y = (c1 * p1 + c2 * p3 + c3 * t1y + c4 * t2y + 0.5)|0;

				res.push(x, y);
			}
		}

		// render point array
		this.lines(res);

		return this;
	};

	/**
	 * Converts and draws an aliased image. Optional parameters for
	 * width and height and mode.
	 *
	 * With mode set the image can be reduced to a palette index image
	 * as well as dithered (Floyd-Steinberg, Sierra light etc.).
	 *
	 * Mode can be one of the following:
	 * <pre>
	 * 24bit (default)
	 * 16bit
	 * 12bit
	 * 8bit
	 * 1bit / mono
	 * palette
	 * </pre>
	 *  To activate dithering append the name of the method to the mode:
	 * <pre>
	 * -fs			Floyd-Steinberg dithering
	 * -sierra		Sierra (light) dithering
	 * </pre>
	 * If no valid mode is given it will return the original 24-bit
	 * image at new size. Mode mono and 1bit is the same.
	 *
	 * For palette mode to work you must set a palette using the
	 * [palette()]{@link Context#palette} method.
	 *
	 * NOTE: Image source must fulfill cross-origin sharing requirements.
	 *
	 * @example
	 * ctx.drawImage(image, 0, 0, 20, 200, '8bit-sierra');
	 *
	 * @param {Image|HTMLCanvasElement|HTMLVideoElement} src - Image, Canvas or Video source
	 * @param {Number} x - start position x
	 * @param {Number} y - start position y
	 * @param {Number} [w] - width of resulting image (or original width is used)
	 * @param {Number} [h] - height of resulting image (or original height is used)
	 * @param {String} [mode] - conversion mode
	 * @returns {Context}
	 */
	this.drawImage = function(src, x, y, w, h, mode) {

		x = (x|0) + translateX;
		y = (y|0) + translateY;
		w = (w || src.width)|0;
		h = (h || src.height)|0;

		// Convert RGB to "indexed palette" optionally with dithering
		if (isStr(mode)) {
			nctx.putImageData(
				reduceImage(src, w, h, currentPalette, mode, true),
				x, y);
		}
		else {
			nctx.drawImage(src, x, y, w, h);
		}

		nblit();

		if (autoCommit) commit();

		return this;
	};

	/**
	 * Draws an aliased clipped version of an image, canvas or video
	 * element. Source positions must be integer value and inside
	 * source image.
	 *
	 * NOTE: Image source must fulfill cross-origin sharing requirements.
	 *
	 * @param {Image|HTMLCanvasElement|HTMLVideoElement} src - Image, Canvas or Video source
	 * @param {Number} sx - source x
	 * @param {Number} sy - source y
	 * @param {Number} sw - source width
	 * @param {Number} sh - source height
	 * @param {Number} dx - destination x
	 * @param {Number} dy - destination y
	 * @param {Number} dw - destination width
	 * @param {Number} dh - destination height
	 * @returns {Context}
	 */
	this.drawImageClipped = function(src, sx, sy, sw, sh, dx, dy, dw, dh) {

		sx |= 0;
		sy |= 0;
		sw |= 0;
		sh |= 0;

		dx = (dx|0) + translateX;
		dy = (dy|0) + translateY;
		dw |= 0;
		dh |= 0;

		// validate
		if (sx < 0) sx = 0;
		if (sy < 0) sy = 0;
		if (sx >= src.width) sx = src.width - 1;
		if (sy >= src.height) sy = src.height - 1;
		if (sx + sw > src.width) sw = src.width - sx;
		if (sy + sh > src.height) sh = src.height - sy;

		nctx.drawImage(src, sx, sy, sw, sh, dx, dy, dw, dh);

		nblit();

		if (autoCommit) commit();

		return this;
	};

	/**
	 * Enable or disable (pseudo) XOR mode. If enabled the drawings will
	 * inverse the already drawn content with the current color's
	 * bitmask. Does not affect images or bucket fill.
	 *
	 * @param {Boolean} [mode] Returns current mode if no argument is given.
	 * @returns {Context|Boolean} If no argument is given current mode is returned.
	 */
	this.xorMode = function(mode) {

		if (!isBool(mode))
			return xorMode;

		xorMode = mode;

		this.setPixel = mode ? _setPixelXOR : _setPixel;
		setPixel = this.setPixel;

		return this;
	};

	/**
	 * Scrolls the bitmap by delta x and y pixels. If clearGap is set
	 * the resulting gap will be cleared. If not it will leave the
	 * original graphics in the "gap". All arguments must be integer
	 * values.
	 *
	 * Note: This method is not affected by [translate()]{@link Context#translate}
	 *
	 * @param {Number} dx - delta X
	 * @param {Number} dy - delta Y
	 * @param {Boolean} [clearGap=False] Clears the gap left from the scroll
	 * @returns {Context}
	 */
	this.scroll = function(dx, dy, clearGap) {

		var	doClear = (clearGap && fillColor !==null),
			xOffset,
			xStart,	xEnd,
			yStart = 0,
			yEnd = resY,
			dlt, dlt1, dlt2, dlt3, dlt4, dlt5, dlt6, dlt7;

		if (dx === 0 && dy === 0)
			return this;

		if (dx <= -resX || dx >= resX || dy <= -resY || dy >= resY) {
			if (doClear) me.clear();
		}
		else {

			// scroll vertically (optimized)
			if (dy !== 0) {

				if (dy < 0) {

					yStart = -dy * resX;
					yEnd = (resY + dx) * resX;
					dlt = yStart;
					dlt1 = dlt + 1;
					dlt2 = dlt1 + 1;
					dlt3 = dlt2 + 1;
					dlt4 = dlt3 + 1;
					dlt5 = dlt4 + 1;
					dlt6 = dlt5 + 1;
					dlt7 = dlt6 + 1;

					for(; yStart < yEnd; yStart += 8) {
						buffer32[yStart] = buffer32[yStart + dlt];
						buffer32[yStart + 1] = buffer32[yStart + dlt1];
						buffer32[yStart + 2] = buffer32[yStart + dlt2];
						buffer32[yStart + 3] = buffer32[yStart + dlt3];
						buffer32[yStart + 4] = buffer32[yStart + dlt4];
						buffer32[yStart + 5] = buffer32[yStart + dlt5];
						buffer32[yStart + 6] = buffer32[yStart + dlt6];
						buffer32[yStart + 7] = buffer32[yStart + dlt7];
					}

					if (doClear) {
						for(yEnd = resY * resX; yStart < yEnd; yStart++)
							buffer32[yStart] = fillColor;
					}

					yStart = 0;
					yEnd = resY + dy;
				}
				else {

					yStart = (resY - dy) * resX;
					yEnd = 0;
					dlt = resX * dy;
					dlt1 = dlt - 1;
					dlt2 = dlt1 - 1;
					dlt3 = dlt2 - 1;
					dlt4 = dlt3 - 1;
					dlt5 = dlt4 - 1;
					dlt6 = dlt5 - 1;
					dlt7 = dlt6 - 1;

					for(; yStart > yEnd; yStart -= 8) {
						buffer32[yStart + dlt7] = buffer32[yStart - 7];
						buffer32[yStart + dlt6] = buffer32[yStart - 6];
						buffer32[yStart + dlt5] = buffer32[yStart - 5];
						buffer32[yStart + dlt4] = buffer32[yStart - 4];
						buffer32[yStart + dlt3] = buffer32[yStart - 3];
						buffer32[yStart + dlt2] = buffer32[yStart - 2];
						buffer32[yStart + dlt1] = buffer32[yStart - 1];
						buffer32[yStart + dlt] = buffer32[yStart];
					}

					if (doClear) {
						for(yStart = 0; yStart < dlt; yStart++)
							buffer32[yStart] = fillColor;
					}

					yStart = dy;
					yEnd = resY;
				}
			}

			// scroll horizontally (non-optimized but considers y scroll region)
			if (dx !== 0) {

				if (dx > 0) {

					xEnd = dx;
					dlt = dx;

					for(; yStart < yEnd; yStart++) {
						xOffset = yStart * resX;
						for(xStart = resX; xStart > xEnd; xStart--)
							buffer32[xOffset + xStart] = buffer32[xOffset + xStart - dlt];

						if (doClear) {
							for(; xStart >= 0; xStart--)
								buffer32[xOffset + xStart] = fillColor;
						}
					}

				}
				else {

					xEnd = resX + dx;
					dlt = -dx;

					for(; yStart < yEnd; yStart++) {

						xOffset = yStart * resX;

						for(xStart = 0; xStart < xEnd; xStart++)
							buffer32[xOffset + xStart] = buffer32[xOffset + xStart + dlt];

						if (doClear) {
							for(; xStart < resX; xStart++)
								buffer32[xOffset + xStart] = fillColor;
						}
					}
				}
			}

		}

		if (autoCommit) commit();

		return this;
	};

	/**
	 * Copies ("blits") a region from the bitmap to destination
	 * position. All source positions must be inside the bitmap. All
	 * values must be integer values.
	 *
	 * Note: This method is not affected by [translate()]{@link Context#translate}
	 *
	 * Note: This call will commit even if
	 * [autoCommit()]{@link Context#autoCommit} is disabled.
	 *
	 * @param {Number} x - source x
	 * @param {Number} y - source y
	 * @param {Number} w - source width
	 * @param {Number} h - source height
	 * @param {Number} dx - destination x
	 * @param {Number} dy - destination y
	 * @returns {Context}
	 */
	this.blit = function(x, y, w, h, dx, dy) {

		if (x >= resX || y >= resY) return this;

		if (x + w > resX) w = resX - x;
		if (y + h > resY) h = resY - h;

		var idata = ctx.getImageData(x, y, w, h);

		if (xorMode) {

			var	b32 = new Uint32Array(idata.data.buffer),
				l = b32.length;

			while(l--) {
				b32[l] ^= (b32[l] & xorMask);
			}
		}
		ctx.putImageData(idata, dx, dy);

		commit(true);

		return this;
	};

	/**
	 * Sets a single pixel using current [penColor()]{@link retro.penColor}.
	 * If you need to draw many pixels it's recommended to disable
	 * [autoCommit()]{@link retro.Context#autoCommit} and manually
	 * [commit()]{@link retro.Context#commit} when done.
	 *
	 * All values must be integer values.
	 *
	 * @param {Number} x - x position
	 * @param {Number} y - y position
	 * @returns {Context}
	 */
	this.setPixel = function(x, y) {
		setPixel(x, y);
		if (autoCommit) commit();
		return this;
	};

	/**
	 * Returns the on-screen canvas element used for the context.
	 *
	 * @returns {HTMLCanvasElement}
	 */
	this.getCanvas = function() {
		return dstCanvas;
	};

	/**
	 * Returns a value for a single pixel at x and y as an integer value.
	 * x and y values must be integer values.
	 *
	 * Note that the byte order of the integer value is platform sensitive.
	 *
	 * @param {Number} x - x position
	 * @param {Number} y - y position
	 * @returns {Number} Integer representation of pixel color
	 */
	this.getPixel = function(x, y) {
		return getPixel(x, y);
	};

	/**
	 * Returns a value as a [Color]{@link retro.Color} object for a pixel
	 * at x and y as integer values.
	 *
	 * @param {Number} x - x position
	 * @param {Number} y - y position
	 * @returns {retro.Color}
	 */
	this.getPixelCol = function(x, y) {
		var c = int2rgb(getPixel(x, y));
		return new retro.Color(c[0], c[1], c[2]);
	};

	/**
	 * Returns the index representing the closest color for pixel at
	 * x and y.
	 *
	 * Note: A palette need to be set previous to this call.
	 *
	 * @param {Number} x - x position to read pixel from
	 * @param {Number} y - y position to read pixel from
	 * @returns {Number} - an index or -1 if no palette was set
	 */
	this.getPixelIndex = function(x, y) {

		if (currentPalette) {
			var c = int2rgb(getPixel(x, y));
			return currentPalette.getNearestIndex(c[0], c[1], c[2]);
		}
		else
			return -1;
	};

	/**
	 * Fills a continuous area of the same color found at x and y with
	 * current [fillColor()]{@link Context#fillColor}.
	 *
	 * Note: This call is not affected by
	 * [xorMode()]{@link Context#xorMode}.
	 *
	 * @param {Number} x - x start point for fill
	 * @param {Number} y - y start point for fill
	 * @returns {Context}
	 */
	this.bucketFill = function(x, y) {

		//var tr = me.translate();
		//me.translate(-tr.deltaX, -tr.deltaY);

		x |= 0; // + tr.deltaX;
		y |= 0; // + tr.deltaY;

		var	sp			= 2,
			stack		= new Uint16Array(resX * resY * 2),
			completed	= new Uint8Array(resX * resY),
			targetColor	= getPixel32(x, y),
			resX1 		= resX - 1,
			resY1 		= resY - 1,
 			w1, w2,
			cx, cy,
			p, py, cyp, pyp, cypp;

		stack[0] = x;
		stack[1] = y;

		completed[y * resX + x] = 1;

		while(sp) {

			sp -= 2;

			cx = stack[sp];
			cy = stack[sp + 1];

			if (getPixel32(cx, cy) === targetColor) {

				setPixelFill(cx, cy);

				w1 = w2 = cx;

				while (w1 > 0 && (getPixel32(w1 - 1, cy) === targetColor)) {
					p = cy * resX + (--w1);
					if (completed[p] === 1) break;
					buffer32[p] = fillColor;
				}

				while (w2 < resX1 && (getPixel32(w2 + 1, cy) === targetColor)) {
					p = cy * resX + (++w2);
					if (completed[p] === 1) break;
					buffer32[p] = fillColor;
				}

				py = pyp = cy;
				py--;
				pyp++;

				cyp = py * resX;
				cypp = pyp * resX;

				for (cx = w1; cx <= w2; cx++) {

					if (cy > 0) {

						if (getPixel32(cx, py) === targetColor) {

							p = cyp + cx;

							if (completed[p] === 0) {
								completed[p] = 1;
								stack[sp++] = cx;
								stack[sp++] = py;
							}
						}
					}

					if (cy < resY1) {

						if (getPixel32(cx, pyp) === targetColor) {

							p = cypp + cx;

							if (completed[p] === 0) {
								completed[p] = 1;
								stack[sp++] = cx;
								stack[sp++] = pyp;
							}
						}
					}
				} // for
			} // if same colors
		} // while

		//me.translate(tr.deltaX, tr.deltaY);

		if (autoCommit) commit();

		return this;
	};

	/********************************************************************
	*																	*
	*	FONTS															*
	*																	*
	********************************************************************/

	/**
	 * Loads and prepares a defined bitmap font for use and adds it to
	 * an internal collection which is used with [font()]{@link Context#font}.
	 * When font is loaded the function defined as callback is called.
	 *
	 * Note: This method is asynchronous due to the image loading.
	 *
	 * The callback provides an object with properties <code>id</code>
	 * and <code>timestamp</code>.
	 *
	 * @param {Object} fontObj - JSON font object (see fonts.js for example)
	 * @param {Function} onsuccess - function called when font is loaded and processed
	 * @param {Function} [onerror] - optional error callback
	 * @returns {Context}
	 */
	this.addFont = function(fontObj, onsuccess, onerror) {

		var i = 0, img;

		if (fontObj.map.length === 0)
			throw 'You need to specify a map for the font.';

		// Check if font with this ID is already registered
		for(; i < fonts.length; i++) {
			if (fonts[i].id === fontObj.id)
				throw 'A font with this ID already exists';
		}

		// Load font image
		function handleImage() {

			var c = document.createElement('canvas'),
				ctx = c.getContext('2d'),
				p = 0,
				ix = 0, iy = 0,
				idata, buffer,

				w = fontObj.charWidth,
				h = fontObj.charHeight,
				l = fontObj.map.length, //charCount,

				invert = isBool(fontObj.invert) ? fontObj.invert : false,

				font = {
					id		: fontObj.id,
					cw		: w,
					ch		: h,
					length	: l,
					map		: fontObj.map,
					canvas	: c,
					ctx		: ctx
				},
				mask = invert ? 0xffffffff : (retro._isLSB ? 0xff000000 : 0xff);

			c.width = l * w;
			c.height = h;

			font.canvas = c;
			font.ctx = ctx;

			// Parse image and make a single stripe of it
			for(; p < l; p++) {

				// get a char
				ctx.drawImage(img, ix, iy, w, h,  p * w, 0 , w, h);

				ix += w;
				if (ix >= img.width) {
					ix = 0;
					iy += h;
				}
			}

			// Convert bits so all black pixels are solid, rest is transparent
			idata  = ctx.getImageData(0, 0, c.width, c.height);
			buffer = new Uint32Array(idata.data.buffer);
			p = buffer.length;

			while(p--) {
				if (buffer[p] !== mask) {
					buffer[p] = 0;
				}
			}

			ctx.putImageData(idata, 0, 0);

			// Store font object
			fonts.push(font);

			if (isFunc(onsuccess))
				onsuccess({
					id: font.id,
					timeStamp: (new Date()).getTime()
				});
		}

		if (fontObj.url instanceof Image || fontObj.url instanceof HTMLCanvasElement) {
			img = fontObj.url;
			handleImage();

		}
		else {

			img = document.createElement('img');
			img.onload = handleImage;

			if (isFunc(onerror))
				img.onerror = onerror;

			if (isBool(fontObj.CORS) && fontObj.CORS === true)
				img.crossOrigin = '';

			img.src = fontObj.url;
		}

		return this;
	};

	/**
	 * Load multiple fonts at once. See [addFont()]{@link Context#addFont}
	 * for more details.
	 *
	 * @param {Array} fontList - list of font objects to load
	 * @param {Function} onsuccess - call this function when done
	 * @param {Function} [onerror] - optional error callback
	 * @returns {Context}
	 */
	this.addFonts = function(fontList, onsuccess, onerror) {

		var count = fontList.length,
			i = 0;

		for(; i < fontList.length; i++) {
			if (isFunc(onerror)) {
				me.addFont(fontList[i], loader, errorHandler);
			}
			else
				me.addFont(fontList[i], loader);
		}

		function loader() {
			count--;
			if (count === 0) onsuccess();
		}

		function errorHandler(e) {
			onerror(e);
			loader();
		}

		return this;
	};

	/**
	 * Sets an already loaded font as current font for
	 * [text()]{@link Context#text}.
	 *
	 * If no argument is given then current ID (if any) is returned or
	 * an empty string if none.
	 *
	 * @param {String} [id] ID of font specified in the original JSON object
	 * @returns {Context|String} If no argument is given current ID is returned as string.
	 */
	this.font = function(id) {

		if (!isStr(id))
			return currentFont ? currentFont.id : '';

		for(var i = 0; i < fonts.length; i++) {
			if (fonts[i].id === id) {
				currentFont = fonts[i];
				return this;
			}
		}

		throw 'Font "' + id + '" not added';
	};

	/**
	 * Draws a text using current bitmap font set with
	 * [font()]{@link retro.Context#font}.
	 *
	 * The x and y must be integer values. [textAlign()]{@link retro.Context#textAlign}
	 * and [textBaseline()]{@link retro.Context#textBaseline} will affect the
	 * position.
	 *
	 * @param {String} txt - string to render
	 * @param {Number} x - x position to render text (upper left corner)
	 * @param {Number} y - y position to render text (upper left corner)
	 * @returns {Context}
	 */
	this.text = function(txt, x, y) {

		if (!isStr(txt) || txt.length === 0)
			return this;

		if (currentFont === null)
			throw 'No font is set!';

		var	col		= 'rgb(' + int2rgb(penColor).join() + ')',
			pos		= getTextPos(txt, x, y),
			i		= 0,
			w		= currentFont.cw,
			h		= currentFont.ch,
			map		= currentFont.map,
			octx	= currentFont.ctx,
			len		= txt.length,
			tx		= 0,
			txtMax	= resX - w,
			mi,
			chr;

		x = pos.x;
		y = pos.y;

		// Set background color
		if (fillColor) {
			nctx.fillStyle = fillCSS;
			nctx.fillRect(x, y, len * w, h);
		}

		// Set color to current pen color
		if (prevFontPen !== penColor) {
			octx.globalCompositeOperation = 'source-in';
			octx.fillStyle = col;
			octx.fillRect(0, 0, currentFont.canvas.width, currentFont.canvas.height);
			prevFontPen = penColor;
		}

		// Parse text and draw sprites from bitmap font sprite-sheet
		for(; i < len && tx < txtMax; i++) {

			chr = txt[i];
			mi = map.indexOf(chr);
			tx = x + i * w;

			if (mi > -1 && tx >= -w)
				nctx.drawImage(currentFont.canvas, mi * w, 0, w, h,  tx, y, w, h);
		}

		nblitRng(y, y + h);

		if (autoCommit) commit();

		return this;
	};

	/**
	 * Measuring the txt string using current set bitmap
	 * [font()]{@link retro.Context#font}.
	 * Returns an object with properties width and height. If no font is set
	 * width and height will both be 0.
	 *
	 * @param {String} txt - string to measure
	 * @returns {{width: Number, height: Number}} Object with properties width and height
	 */
	this.measureText = function(txt) {

		if (currentFont === null)
			return {
				width : 0,
				height: 0
			};

		return {
			width : txt.length * currentFont.cw,
			height: currentFont.ch
		}
	};

	/**
	 * Set alignment of text drawn from x and y. Possible values can be
	 * left (default), center or middle and right.
	 *
	 * @param {String} [align] - if no argument is given current alignment is returned
	 * @returns {Context|String}
	 */
	this.textAlign = function(align) {

		if (arguments.length === 0)
			return textAlign;

		if (align === 'left' || align === 'center' || align === 'middle' || align === 'right') {
			textAlign = align;
		}

		return this;
	};

	/**
	 * Set vertical alignment of text drawn from x and y. Possible values can be
	 * top (default), center or middle and bottom.
	 *
	 * @param {String} [base] - if no argument is given current baseline is returned
	 * @returns {Context|String}
	 */
	this.textBaseline = function(base) {

		if (arguments.length === 0)
			return textBaseline;

		if (base === 'top' || base === 'center' || base === 'middle' || base === 'bottom') {
			textBaseline = base;
		}

		return this;
	};

	/**
	 * Helper function for text() to calc. actual position based on
	 * alignment/baseline.
	 *
	 * @param {String} txt
	 * @param {Number} x
	 * @param {Number} y
	 * @returns {{x: Number, y: Number}}
	 * @private
	 */
	function getTextPos(txt, x, y) {

		x += translateX;
		y += translateY;

		var sz = me.measureText(txt),
			w = sz.width,
			h = sz.height;

		switch(textAlign) {

			case 'center':
			case 'middle':
				x -= (w * 0.5 + 0.5)|0;
				break;

			case 'right':
				x -= w;
		}

		switch(textBaseline) {

			case 'center':
			case 'middle':
				y -= (h * 0.5 + 0.5)|0;
				break;

			case 'bottom':
				y -= h;
		}

		return {
			x: x,
			y: y
		};
	}

	/********************************************************************
	*																	*
	*	TRANSFORMS														*
	*																	*
	********************************************************************/

	/**
	 * Translate the context for sub-sequent draw operations. If you
	 * want to translate current content use [scroll()]{@link Context#scroll}
	 * instead.
	 *
	 * If no arguments are given then current translation is returned as
	 * an object width properties deltaX and deltaY. Both arguments must
	 * be given otherwise.
	 *
	 * @param {Number} [deltaX] - translate this value in x direction
	 * @param {Number} [deltaY] - translate this value in y direction
	 * @returns {Context|Object}
	 */
	this.translate = function(deltaX, deltaY) {

		if (arguments.length === 0) {
			return {
				deltaX: translateX,
				deltaY: translateY
			}
		}

		translateX += (deltaX|0);
		translateY += (deltaY|0);

		return this;
	};

	/********************************************************************
	 *																	*
	 *	INTERNALS														*
	 *																	*
	 ********************************************************************/

	function _setPixel(x, y) {

		x += translateX;
		y += translateY;

		if (x < resX && y < resY && x >= 0 && y >= 0)
			buffer32[y * resX + x] = penColor;
	}

	function _setPixelFill(x, y) {

		x += translateX;
		y += translateY;

		if (x < resX && y < resY && x >= 0 && y >= 0)
			buffer32[y * resX + x] = fillColor;
	}

	function _setPixelFast(x, y) {
		buffer32[y * resX + x] = penColor;
	}

	function _setPixelXOR(x, y) {

		if (x >= 0 && y >= 0 && x < resX && y < resY)
			buffer32[y * resX + x] ^= (penColor & xorMask);
	}

	function getPixel(x, y) {

		x += translateX;
		y += translateY;

		if (x < 0 || y < 0 || x >= resX || y >= resY) return [0, 0, 0, 0];

		var p = (y * resX + x) * 4;

		return [buffer[p], buffer[p + 1], buffer[p + 2], buffer[p + 3]];
	}

	function getPixel32(x, y) {

		x += translateX;
		y += translateY;

		if (x < 0 || y < 0 || x >= resX || y >= resY) return 0;

		return buffer32[y * resX + x];
	}

	/**
	 * Commit current pixel buffer to destination canvas.
	 * If merge is true it will put buffer first to internal, then get
	 * it to be able to merge native produced graphics with the pixel
	 * buffer.
	 *
	 * @param {Boolean} [merge=False]
	 * @private
	 */
	function commit(merge) {

		if (merge === true) {
			getBuffers(resX, resY, true);

		} else {
			ctx.putImageData(idata, 0, 0);
		}

		dctx.drawImage(canvas, 0, 0, dstCanvas.width, dstCanvas.height);
	}

	function rgb2intLSB(r, g, b) {
		return 0xff000000 + (b << 16) + (g << 8) + r;
	}

	function rgb2intMSB(r, g, b) {
		return (r << 24) + (g << 16) + (b << 8) + 255;
	}

	function int2rgbLSB(i) {

		i = i || 0;

		var r = (i & 0xff),
			g = (i & 0xff00) >> 8,
			b = (i & 0xff0000) >> 16;

		return [r, g, b];
	}

	function int2rgbMSB(i) {

		i = i || 0;

		var b = (i & 0xff00) >> 8,
			g = (i & 0xff0000) >> 16,
			r = (i & 0xff000000) >> 24;

		return [r, g, b];
	}

	/**
	 * Copies non-transparent pixels from temp canvas to back-buffer.
	 * @private
	 */
	function nblit() {

		var idata = nctx.getImageData(0, 0, resX, resY),
			b32 = new Uint32Array(idata.data.buffer),
			len = b32.length,
			i = 0,
			c1, c2, c3, c4, c5, c6, c7, c8;

		for(; i < len; i += 8) {
			c1 = b32[i];
			c2 = b32[i+1];
			c3 = b32[i+2];
			c4 = b32[i+3];
			c5 = b32[i+4];
			c6 = b32[i+5];
			c7 = b32[i+6];
			c8 = b32[i+7];
			if (c1 > 0) buffer32[i] = c1;
			if (c2 > 0) buffer32[i+1] = c2;
			if (c3 > 0) buffer32[i+2] = c3;
			if (c4 > 0) buffer32[i+3] = c4;
			if (c5 > 0) buffer32[i+4] = c5;
			if (c6 > 0) buffer32[i+5] = c6;
			if (c7 > 0) buffer32[i+6] = c7;
			if (c8 > 0) buffer32[i+7] = c8;
		}

		ncanvas.width = resX;
	}

	/**
	 * Copies any non-transparent pixels and sets a pre-defined color.
	 *
	 * @param {Number} col - integer value
	 * @private
	 */
	function nblitC(col) {

		var idata = nctx.getImageData(0, 0, resX, resY),
			b32 = new Uint32Array(idata.data.buffer),
			len = b32.length,
			i = 0;

		for(; i < len; i += 8) {
			if (b32[i] > 0) buffer32[i] = col;
			if (b32[i+1] > 0) buffer32[i+1] = col;
			if (b32[i+2] > 0) buffer32[i+2] = col;
			if (b32[i+3] > 0) buffer32[i+3] = col;
			if (b32[i+4] > 0) buffer32[i+4] = col;
			if (b32[i+5] > 0) buffer32[i+5] = col;
			if (b32[i+6] > 0) buffer32[i+6] = col;
			if (b32[i+7] > 0) buffer32[i+7] = col;
		}

		ncanvas.width = resX;
	}

	/**
	 *
	 * @param {number} y1
	 * @param {number} y2
	 * @private
	 */
	function nblitRng(y1, y2) {

		var idata = nctx.getImageData(0, 0, resX, resY),
			b32 = new Uint32Array(idata.data.buffer),
			c1, c2, c3, c4, c5,c6, c7, c8;

		y1 *= resX;
		y2 *= resX;

		for(; y1 < y2; y1 += 8) {
			c1 = b32[y1];
			c2 = b32[y1+1];
			c3 = b32[y1+2];
			c4 = b32[y1+3];
			c5 = b32[y1+4];
			c6 = b32[y1+5];
			c7 = b32[y1+6];
			c8 = b32[y1+7];
			if (c1 > 0) buffer32[y1] = c1;
			if (c2 > 0) buffer32[y1+1] = c2;
			if (c3 > 0) buffer32[y1+2] = c3;
			if (c4 > 0) buffer32[y1+3] = c4;
			if (c5 > 0) buffer32[y1+4] = c5;
			if (c6 > 0) buffer32[y1+5] = c6;
			if (c7 > 0) buffer32[y1+6] = c7;
			if (c8 > 0) buffer32[y1+7] = c8;
		}

		ncanvas.width = resX;
	}

	/********************************************************************
	*																	*
	*	EVENTS															*
	*																	*
	********************************************************************/

	//TODO eval. if direct event handler can be set - if not we could
	// create a pseudo addEventListener to avoid listening to all events
	// simultaneously... Add addProp...

	/**
	 * Callback vector for mouse onclick
	 */
	this.onclick		=

	/**
	 * Callback vector for mouse ondblclick
	 */
	this.ondblclick		=

	/**
	 * Callback vector for mouse onmousedown
	 */
	this.onmousedown	=

	/**
	 * Callback vector for mouse onmousemove
	 */
	this.onmousemove	=

	/**
	 * Callback vector for mouse onmouseover
	 */
	this.onmouseover	=

	/**
	 * Callback vector for mouse onmouseout
	 */
	this.onmouseout		=

	/**
	 * Callback vector for mouse onmouseenter
	 */
	this.onmouseenter	=

	/**
	 * Callback vector for mouse onmouseleave
	 */
	this.onmouseleave	=

	/**
	 * Callback vector for mouse onmouseup
	 */
	this.onmouseup		=

	/**
	 * Callback vector for mouse onkeydown
	 */
	this.onkeydown		=

	/**
	 * Callback vector for mouse onkeypress
	 */
	this.onkeypress		=

	/**
	 * Callback vector for mouse onkeyup
	 */
	this.onkeyup		= undefined;

	dstCanvas.addEventListener('click', handleClick, false);
	dstCanvas.addEventListener('dblclick', handleDblClick, false);
	dstCanvas.addEventListener('mousedown', handleMouseDown, false);
	dstCanvas.addEventListener('mouseover', handleMouseOver, false);
	dstCanvas.addEventListener('mouseout', handleMouseOut, false);
	dstCanvas.addEventListener('mouseenter', handleMouseEnter, false);
	dstCanvas.addEventListener('mouseleave', handleMouseLeave, false);

	window.addEventListener('mousemove', handleMouseMove, false);
	window.addEventListener('mouseup', handleMouseUp, false);
	window.addEventListener('keydown', handleKeyDown, false);
	window.addEventListener('keypress', handleKeyPress, false);
	window.addEventListener('keyup', handleKeyUp, false);

	//TODO add mouse wheel support

	function handleClick(e) {
		if (isFunc(me.onclick))
			sendMouseEvent(e, me.onclick);
	}

	function handleDblClick(e) {
		if (isFunc(me.ondblclick))
			sendMouseEvent(e, me.ondblclick);
	}

	function handleMouseDown(e) {
		if (isFunc(me.onmousedown))
			sendMouseEvent(e, me.onmousedown);
	}

	function handleMouseMove(e) {
		if (isFunc(me.onmousemove))
			sendMouseEvent(e, me.onmousemove);
	}

	function handleMouseOver(e) {
		if (isFunc(me.onmouseover))
			sendMouseEvent(e, me.onmouseover);
	}

	function handleMouseEnter(e) {
		if (isFunc(me.onmouseenter))
			sendMouseEvent(e, me.onmouseenter);
	}

	function handleMouseLeave(e) {
		if (isFunc(me.onmouseleave))
			sendMouseEvent(e, me.onmouseleave);
	}

	function handleMouseOut(e) {
		if (isFunc(me.onmouseout))
			sendMouseEvent(e, me.onmouseout);
	}

	function handleMouseUp(e) {
		if (isFunc(me.onmouseup))
			sendMouseEvent(e, me.onmouseup);
	}

	function handleKeyDown(e) {
		if (isFunc(me.onkeydown))
			sendKeyEvent(e, me.onkeydown);
	}

	function handleKeyPress(e) {
		if (isFunc(me.onkeypress))
			sendKeyEvent(e, me.onkeypress);
	}

	function handleKeyUp(e) {
		if (isFunc(me.onkeyup))
			sendKeyEvent(e, me.onkeyup);
	}

	function getPos(e) {

		var rect = dstCanvas.getBoundingClientRect();

		return {
			x: ((e.clientX - rect.left) * scaleX)|0,
			y: ((e.clientY - rect.top) * scaleY)|0
		}
	}

	function sendMouseEvent(e, func) {

		e = e || event;

		var pos = getPos(e);

		func({
			button: e.button,
			buttons: e.buttons,
			altKey: e.altKey,
			ctrlKey: e.ctrlKey,
			metaKey: e.metaKey,
			shiftKey: e.shiftKey,
			x: pos.x,
			y: pos.y,
			event: e,
			timeStamp: e.timeStamp,
			preventDefault: e.preventDefault,
			stopPropagation: e.stopPropagation,
			source: me
		});
	}

	function sendKeyEvent(e, func) {

		e = e || event;

		var pos = getPos(e);

		func({
			altKey: e.altKey,
			ctrlKey: e.ctrlKey,
			metaKey: e.metaKey,
			shiftKey: e.shiftKey,
			charCode: e.charCode,
			key: e.keyCode || e.which,  //e.key will give 'g' instead of its number etc.
			x: pos.x,
			y: pos.y,
			event: e,
			timeStamp: e.timeStamp,
			preventDefault: e.preventDefault,
			stopPropagation: e.stopPropagation,
			source: me
		});
	}

	/********************************************************************
	*																	*
	*	SYSTEM															*
	*																	*
	********************************************************************/

	/**
	 * Initialize masks and values based on endianess of the system.
	 *
	 * @private
	 */
	function initEndian() {

		if (retro._isLSB === true) {

			rgb2int = rgb2intLSB;
			int2rgb = int2rgbLSB;

			onMask		= 0xff000000;
			xorMask		= 0x00ffffff;
			penColor	= 0xffffffff;
			fillColor	= 0xff000000;

		} else {

			rgb2int = rgb2intMSB;
			int2rgb = int2rgbMSB;

			onMask		= 0xff;
			xorMask		= 0xff000000;
			penColor	= 0xffffffff;
			fillColor	= 0xff;
		}
	}

	/**
	 * Sets up the destination (on-screen) canvas turning off image
	 * smoothing and resetting the transformation matrix. It also do
	 * the same for the internal canvas.
	 *
	 * It can be called manually and externally by using the
	 * update() method.
	 *
	 * @private
	 */
	function initCanvas() {

		dctx = dstCanvas.getContext('2d', {'alpha': false});

		dctx.setTransform(1, 0, 0, 1, 0, 0);
		nctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.setTransform(1, 0, 0, 1, 0, 0);

		noImageSmoothing(dctx);
		noImageSmoothing(nctx);
		noImageSmoothing(ctx);

		dctx.globalCompositeOperation = 'copy';
	}

	/**
	 * Produces and updates the internal 8-bits and 32-bits buffers.
	 *
	 * The merge flag is set to true if any draw operations outside
	 * pixel manipulation such as drawImage, CONTEXT methods etc. has
	 * been used to merge that graphic into the internal buffer.
	 *
	 * @param {Number} resX
	 * @param {Number} resY
	 * @param {Boolean} merged
	 * @private
	 */
	function getBuffers(resX, resY, merged) {

		idata = (merged)
			? ctx.getImageData(0, 0, resX, resY)
			: ctx.createImageData(resX, resY);

		buffer = idata.data;
		buffer32 = new Uint32Array(buffer.buffer);
	}

	/**
	 * Reduce colors and size of an image. Supports 16-, 12- and 8-bits
	 * as well as PALETTE LUT, dithering (Floyd-Steinberg, Sierra
	 * light) and mono-chrome mode (1-bit).
	 *
	 * Modes can be:
	 *
	 * 24bit
	 * 16bit
	 * 12bit
	 * 8bit
	 * 1bit / mono
	 * palette
	 *
	 * To activate dithering append the name of the method to the mode:
	 *
	 * -fs			Floyd-Steinberg dithering
	 * -sierra		Sierra (light) dithering
	 *
	 * @Example
	 * palette-sierra
	 *
	 * If no valid mode is given it will return the original 24-bit
	 * image at new size. If palette isn't used its argument may be
	 * null.
	 *
	 * @param {HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} img
	 * @param {Number} w
	 * @param {Number} h
	 * @param {retro.Palette} palette
	 * @param {String} mode
	 * @param {Boolean=} retData - returns ImageData instead of retro.canvas
	 * @returns {*}
	 * @private
	 */
	function reduceImage(img, w, h, palette, mode, retData) {

		//TODO Ordered dithering

		retData = retData || false;

		var ctx = imageToCanvas(img, w, h),
			idata, buffer, buffer32, len,
			cols = [],
			func,
			mask,
			i = 0,
			ix,
			x, y,
			p, yp, yc, oc, nc, err,
			dither,

			args = mode.split('-'),
			pal = args[0],
			ditherMode = args[1] || '';

		idata	= ctx.getImageData(0, 0, w, h);
		buffer	= idata.data;
		len		= buffer.length;

		if (args.length === 2) {

			// convert pixels to Color classes
			for(y = 0; y < h; y++) {

				cols.push([]);

				yp = y * w * 4;

				for(x = 0, yc = cols[y]; x < w; x++) {
					p = yp + x * 4;
					yc.push(new retro.Color(buffer[p], buffer[p + 1], buffer[p + 2]));
				}
			}

			
			// parse options
			switch(pal) {
				case 'palette':
					func = getNearestColor;
					break;
				case '16bit':
					func = retro._isLSB ? colTo16LSB : colTo16MSB;
					break;
				case '12bit':
					func = retro._isLSB ? colTo12LSB : colTo12MSB;
					break;
				case '8bit':
					func = retro._isLSB ? colTo8LSB : colTo8MSB;
					break;
				case '1bit':
				case 'mono':
					func = colToBW;
					break;
			}

			dither = (ditherMode === 'fs') ? ditherFloydSteinberg : ditherSierra;

			for(y = 0, p = 0; y < h; y++) {

				for(x = 0; x < w; x++) {

					oc = cols[y][x];
					nc = func(oc);
					err = oc.sub(nc);

					buffer[p++] = nc.r;
					buffer[p++] = nc.g;
					buffer[p++] = nc.b;
					p++;

					dither(cols, x, y, w, h, err);
				}
			}

			cols = null;

		} else if (mode === 'palette') {

			for(var lut = palette.lut; i < len; i += 4) {

				ix = palette.getNearestIndex(buffer[i], buffer[i+1], buffer[i+2]);
				ix = lut[ix];

				buffer[i]		= ix[0];
				buffer[i + 1]	= ix[1];
				buffer[i + 2]	= ix[2];
			}
		}

		else if (mode === '1bit' || mode === 'mono') {

			var luma;

			for(; i < len; i += 4) {

				luma = buffer[i] * 0.299 + buffer[i + 1] * 0.587 + buffer[i + 2] * 0.114;
				luma = luma >= 128 ? 255 : 0;

				buffer[i]		= luma;
				buffer[i + 1] 	= luma;
				buffer[i + 2] 	= luma;
			}
		}

		else if (mode === '8bit') {

			if (retro._isLSB) {
				for(; i < len; i += 4) {
					buffer[i]	  = buffer[i] & 0xe0 + (buffer[i] >> 3)|0;
					buffer[i + 1] = buffer[i + 1] & 0xe0 + (buffer[i + 2] >> 3)|0;
					buffer[i + 2] = buffer[i + 2] & 0xc0 + (buffer[i + 3] >> 3)|0;
				}
			}
			else {
				for(; i < len; i += 4) {
					buffer[i]	  = buffer[i] & 0x0e + (buffer[i] >> 3)|0;
					buffer[i + 1] = buffer[i + 1] & 0x0e + (buffer[i + 2] >> 3)|0;
					buffer[i + 2] = buffer[i + 2] & 0x0c + (buffer[i + 3] >> 3)|0;
				}
			}

		}
		else {

			buffer32 = new Uint32Array(buffer.buffer);
			len = buffer32.length;

			switch(mode) {
				case '16bit':
					mask = retro._isLSB ? 0xfff8fcf8 : 0x8fcf8fff;
					break;
				case '12bit':
					mask = retro._isLSB ? 0xfff0f0f0 : 0x0f0f0fff;
					break;
				case '8bit':
					mask = retro._isLSB ? 0xffe0e0c0 : 0x0c0e0eff;
					break;
			}

			for(; i < len; i++) buffer32[i] &= mask;
		}

		function colTo16LSB(c) {return new retro.Color(c.r & 0xf8, c.g & 0xfc, c.b & 0xf8)}
		function colTo16MSB(c) {return new retro.Color(c.r & 0x8f, c.g & 0xcf, c.b & 0x8f)}
		function colTo12LSB(c) {return new retro.Color(c.r & 0xf0, c.g & 0xf0, c.b & 0xf0)}
		function colTo12MSB(c) {return new retro.Color(c.r & 0x0f, c.g & 0x0f, c.b & 0x0f)}
		function colTo8LSB(c) {return new retro.Color(c.r & 0xe0 + (c.r>>3), c.g & 0xc0 + (c.g>>3), c.b & 0xe0 + (c.b>>3))}
		function colTo8MSB(c) {return new retro.Color(c.r & 0x0e + (c.r<<3), c.g & 0x0c + (c.g<<3), c.b & 0x0e + (c.b<<3))}
		function colToBW(c) {return c.threshold(150)}
		function getNearestColor(c) {return palette.getNearestColor(c.r, c.g, c.b)}

		function ditherFloydSteinberg(cols, x, y, w, h, err) {

			var xp1 = x + 1,
				y1 = y + 1,
				xm1, colY;

			if (xp1 < w)
				cols[y][xp1] = cols[y][xp1].add(err.mul(0.4375)); /// 7/16

			if (y1 < h) {
				xm1 = x - 1;

				colY = cols[y1];

				colY[x] = colY[x].add(err.mul(0.3125));			/// 5/16

				if (xm1 >= 0)
					colY[xm1] = colY[xm1].add(err.mul(0.1875));	/// 3/16

				if (xp1 < w)
					colY[xp1] = colY[xp1].add(err.mul(0.0625));	/// 1/16
			}

		}

		function ditherSierra(cols, x, y, w, h, err) {

			var xp1 = x + 1,
				xm1 = x - 1,
				y1 = y + 1,
				colY = cols[y1];

			if (xp1 < w)
				cols[y][xp1] = cols[y][xp1].add(err.mul(0.5));			/// /2

			if (y1 < h) {
				colY[x] = colY[x].add(err.mul(0.25));			/// /4

				if (xm1 >= 0)
					colY[xm1] = colY[xm1].add(err.mul(0.25));	/// /4
			}
		}

		if (retData) {
			return idata;
		}
		else {
			ctx.putImageData(idata, 0, 0);
			return c;
		}
	}

	/**
	 * Disables image smoothing on canvas if supported by the browser.
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 * @private
	 */
	function noImageSmoothing(ctx) {

		//var css = '';

		if (isBool(ctx.imageSmoothingEnabled)) {
			ctx.imageSmoothingEnabled = false;
		}
		else if (isBool(ctx.webkitImageSmoothingEnabled)) {
			ctx.webkitImageSmoothingEnabled = false;
			//css = 'image-rendering: -webkit-optimize-contrast;';
		}
		else if (isBool(ctx.mozImageSmoothingEnabled)) {
			ctx.mozImageSmoothingEnabled = false;
			//css = 'image-rendering: -moz-crisp-edges;';
		}
		else if (isBool(ctx.msImageSmoothingEnabled)) {
			ctx.msImageSmoothingEnabled = false;
			//css = '-ms-interpolation-mode: nearest-neighbor;';
		}
		else if (isBool(ctx.oImageSmoothingEnabled)) {
			ctx.oImageSmoothingEnabled = false;
			//css = 'image-rendering: -o-crisp-edges;';
		}

		//css += 'image-rendering: optimize-contrast;';
		//dstCanvas.style.cssText = css;
	}

	/**
	 * Converts an image to a canvas element with aliasing.
	 *
	 * @param {Image} img
	 * @param {Number} w
	 * @param {Number} h
	 * @returns {*|CanvasRenderingContext2D}
	 * @private
	 */
	function imageToCanvas(img, w, h) {

		var canvas	= document.createElement('canvas'),
			ctx		= canvas.getContext('2d');

		canvas.width = w;
		canvas.height = h;

		noImageSmoothing(ctx);
		ctx.drawImage(img, 0, 0, w, h);

		return ctx;
	}

	/** @private */	function isStr(o) {return typeof o === 'string'}
	/** @private */	function isNum(o) {return typeof o === 'number'}
	/** @private */	function isBool(o) {return typeof o === 'boolean'}
	/** @private */	function isObj(o) {return typeof o === 'object'}
	/** @private */	function isFunc(o) {return typeof o === 'function' || isObj(o)}

	/*
	 *	Initialize and go!
	*/
	this.clear();

	return this;
};

/**
 * Checks and holds the system's endianess (little/big - LSB/MSB)
 * @type {boolean}
 */
retro._isLSB = ((new Uint16Array(new Uint8Array([255, 0]).buffer))[0] === 255);
