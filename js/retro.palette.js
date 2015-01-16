/**
 * Creates a PALETTE object and initializes it with the LUT array
 * which contains sub-array or [retro.Color]{@link retro.Color}
 * objects for each RGB color spot in the palette:
 *
 * <code>[ [r0, g0, b0], [r1, g1, b1], ..., [rn, gn, bn]]</code>
 * <code>[ new retro.Color(r0, g0, b0), ..., new retro.Color(rn, gn, bn)]</code>
 *
 * When using name it will set a pre-defined (built-in) palette
 * based on retro computers. These are the available built-in palettes:
 *
 * <pre>
 * AMIGA         - 16 colors palette (default for 16 colors mode)
 * AMSTRADCPC    - 27 colors palette
 * APPLEII       - 16 colors palette
 * AQUARIUS      - 16 colors palette
 * ATARI2600NTSC - 128 colors palette
 * ATARI2600PAL  - 104 colors palette
 * BBC           - 8 colors palette
 * BW            - 2 colors palette (mono b&w monitors)
 * C16           - 128 colors palette
 * C64           - 16 colors palette
 * C64G          - 16 colors palette (gamma corrected)
 * CBMP4         - 121 colors palette
 * CGA           - 16 colors palette
 * EGA           - 64 colors palette
 * GAMEBOY       - 4 colors palette
 * GREEN         - 2 colors palette (mono green colored monitors)
 * INTELLIVISION - 16 colors palette
 * MSX           - 15 colors palette
 * MSX2          - 256 colors palette
 * NES           - 64 colors palette
 * SEGA          - 64 colors palette
 * TELETEXT      - 8 colors palette (for TV tele-text)
 * THOMSONMO5    - 16 colors palette
 * VIC20         - 16 colors palette
 * ZXSPECTRUM    - 16 colors palette
 * </pre>
 *
 * @example
 * var palette = new retro.Palette(array);
 * var palette = new retro.Palette('name');
 *
 * @class retro.Palette
 * @param {String|Array} palette - Name of a pre-defined palette or a Look-up-table (Array)
 * @param {String} [name] - optional parameter for custom palette array
 * @returns {retro.Palette}
 * @constructor
 * @prop {Array} lut - Look-up-table for palette colors
 * @prop {String} name - name of palette given as optional name argument.
 * For internal palette its name in upper-case, or defaults to '<code>custom</code>'
 * @prop {Number} length - number of indexes in this palette
 */
retro.Palette = function(palette, name) {

	var lut, i, e;

	this.name = name || 'custom';
	this.lut = null;

	this._lutCache = [];	//@private

	if (typeof palette === 'string') {

		palette = palette.toUpperCase();

		if (retro.Palette[palette]) {
			this.lut = retro.Palette[palette];
			this.name = palette;
		}
		else
			throw 'Unknown palette name ' + palette;
	}
	else if (Array.isArray(palette)) {

		//TODO allow mixed arrays

		if (palette[0] instanceof retro.Color) {

			lut = [];

			// convert retro.Color array into plain array
			for(i = 0; e = palette[i++];) {
				if (e instanceof retro.Color) lut.push([e.r, e.g, e.b]);
			}

			this.lut = lut;

		}
		else {

			// Verify array content
			for(i = 0; e = palette[i++];) {
				if (e.length !== 3)
					throw 'Invalid palette array. Expected sub-array of 3 entries (RGB) at index ' + i;
			}

			this.lut = palette;
		}
	}

	// Cache integer values of this palette
	for(i = 0; e = this.lut[i++];)
		this._lutCache.push((new retro.Color(e[0], e[1], e[2])).toInt());

	this.length = this.lut.length;

	return this;
};

/**
 * Returns a color object from the color at index in the LUT.
 *
 * @param {Number} index - Color index of the current palette array
 * @returns {retro.Color}
 */
retro.Palette.prototype.getColor = function(index) {

	if (index < 0) index = 0;
	if (index >= this.lut.length) index = this.lut.length - 1;

	var c = this.lut[index];

	return new retro.Color(c[0], c[1], c[2]);
};

/**
 * Get index of color spot in the LUT PALETTE if the RGB values
 * matches 100% or by tolerance. Returns -1 if no index matched.
 *
 * Tolerance is given as percentage [0, 100], default is 0%
 * or no tolerance.
 *
 * @param {Number} r - red
 * @param {Number} g - green
 * @param {Number} b - blue
 * @param {Number} [tolerance] Tolerance in percentage
 * @returns {number}
 */
retro.Palette.prototype.getIndex = function(r, g, b, tolerance) {

	tolerance = ((tolerance || 0) * 2.55 + 0.5)|0;

	var	lut = this.lut,
		c,
		i = 0,
		rmin, rmax, gmin, gmax, bmin, bmax;

	if (tolerance === 0) {
		for(; c = lut[i]; i++)
			if (r === c[0] && g === c[1] && b === c[2]) return i;

	}
	else {
		rmin = r - tolerance;	rmax = r + tolerance;
		gmin = g - tolerance;	gmax = g + tolerance;
		bmin = b - tolerance;	bmax = b + tolerance;

		rmin = Math.max(0, Math.min(255, rmin));
		rmax = Math.max(0, Math.min(255, rmax));
		gmin = Math.max(0, Math.min(255, gmin));
		gmax = Math.max(0, Math.min(255, gmax));
		bmin = Math.max(0, Math.min(255, bmin));
		bmax = Math.max(0, Math.min(255, bmax));

		for(; c = lut[i]; i++) {
			r = c[0];
			g = c[1];
			b = c[2];
			if (r >= rmin && r <= rmax &&
				g >= gmin && g <= gmax &&
				b >= bmin && b <= bmax)	return i;
		}
	}

	return -1;
};

/**
 *	Get the index of the nearest color in the LUT based on RGB.
 *	The function will always return a valid index.
 *
 * @param {Number} r - red
 * @param {Number} g - green
 * @param {Number} b - blue
 * @returns {number} The index of the closest color
 */
retro.Palette.prototype.getNearestIndex = function(r, g, b) {

	var i = 0,
		c, d, dr, dg, db,
		min = 195100,
		mi = -1,
		lut = this.lut,
		l = lut.length;

	for(; i < l; i++) {

		c = lut[i];
		dr = c[0] - r;
		dg = c[1] - g;
		db = c[2] - b;
		d = dr*dr + dg*dg + db*db;

		if (d < min) {
			min = d;
			mi = i;
		}
	}

	return mi;
};

/**
 * Get a color object of the nearest color in the LUT based on RGB.
 * The function will always return a valid color object.
 *
 * @param {Number} r - red
 * @param {Number} g - green
 * @param {Number} b - blue
 * @returns {retro.Color}
 */
retro.Palette.prototype.getNearestColor = function(r, g, b) {

	var mi = this.lut[this.getNearestIndex(r, g, b)];

	return new retro.Color(mi[0], mi[1], mi[2]);
};
