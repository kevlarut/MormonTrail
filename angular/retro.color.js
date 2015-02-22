/**
 * retro.COLOR object
 * @class retro.Color
 * @param {Number} r red
 * @param {Number} g green
 * @param {Number} b blue
 * @constructor
 */
retro.Color = function(r, g, b) {
	this.r = Math.min(Math.max(0, (r + 0.5)|0), 255);
	this.g = Math.min(Math.max(0, (g + 0.5)|0), 255);
	this.b = Math.min(Math.max(0, (b + 0.5)|0), 255);
	this.int32 = 0;

	this.update();
};

/*********  Math operations  *********/

/**
 * Adds given retro.Color to current color of the instance and returns
 * the result as a new retro.Color instance.
 *
 * @param {retro.Color} c Color object
 * @returns {retro.Color}
 */
retro.Color.prototype.add = function(c) {
	return new retro.Color(this.r + c.r, this.g + c.g, this.b + c.b);
};

/**
 * Subtracts given retro.Color to current color of the instance and
 * returns the result as a new retro.Color instance.
 *
 * @param {retro.Color} c Color object
 * @returns {retro.Color}
 */
retro.Color.prototype.sub = function(c) {
	return new retro.Color(this.r - c.r, this.g - c.g, this.b - c.b);
};

/**
 * Multiplies given retro.Color to current color of the instance and
 * returns the result as a new retro.Color instance.
 *
 * @param {Number} f - Multiplication factor
 * @returns {retro.Color}
 */
retro.Color.prototype.mul = function(f) {
	return new retro.Color(this.r * f, this.g * f, this.b * f);
};

/**
 * Bit-shifts current component values number of bit places given
 * by bits to the right and returns the result as a new retro.Color
 * instance.
 *
 * @param {Number} bits - Number of bits to shift
 * @returns {retro.Color}
 */
retro.Color.prototype.rshift = function(bits) {
	return new retro.Color(this.r >> bits, this.g >> bits, this.b >> bits);
};

/**
 * Bit-shifts current component values number of bit places given
 * by bits to the left and returns the result as a new retro.Color
 * instance.
 *
 * @param bits - Number of bits to shift
 * @returns {retro.Color}
 */
retro.Color.prototype.lshift = function(bits) {
	return new retro.Color(this.r << bits, this.g << bits, this.b << bits);
};

/**
 * Calculates a difference vector (non-squared) between the values
 * of instance and the given color object.
 *
 * @param {retro.Color} c - Color object
 * @returns {number} a number representing distance (non-squared)
 */
retro.Color.prototype.diff = function(c) {
	return (this.r * this.r + this.g *this.g + this.b * this.b) - (c.r * c.r + c.g * c.g * c.b * c.b);
};

/**
 * Calculates a difference vector (squared) between the values
 * of instance and the given color object.
 *
 * @param {retro.Color} c - Color object
 * @returns {number} a number representing distance (squared)
 */
retro.Color.prototype.diffSqrt = function(c) {
	return Math.sqrt(this.r * this.r + this.g *this.g + this.b * this.b) - Math.sqrt(c.r * c.r + c.g * c.g * c.b * c.b);
};

/**
 * Returns a black or white color object depending on current color
 * and threshold value. The current color is converted to a luma
 * value and if below threshold a black color is returned, above a
 * white color is returned
 *
 * @param {Number} t - Threshold value [0, 255] inclusive
 * @returns {retro.Color}
 */
retro.Color.prototype.threshold = function(t) {
	var luma = this.r * 0.299 + this.g * 0.587 + this.b * 0.114;
	return luma >= t ? new retro.Color(255, 255, 255) : new retro.Color(0, 0, 0);
};


/**
 * Inverts the current RGB and returns the result as a new
 * retro.Color instance.
 *
 * @returns {retro.Color}
 */
retro.Color.prototype.invert = function() {
	return new retro.Color(255 - this.r, 255 - this.g, 255 - this.b);
};

/**
 * Set new color values for this instance. Use this method instead of
 * setting the RGB properties directly if you need the integer
 * representation.
 *
 * @param {Number} r - red
 * @param {Number} g - green
 * @param {Number} b - blue
 * @returns {retro.Color}
 */
retro.Color.prototype.setRGB = function(r, g, b) {

	this.r = r;
	this.g = g;
	this.b = b;
	this.update();

	return this;
};

/**
 *	Updates the current instance with new color value based on
 *	the 32-bits integer value. The provided value must reflect the byte-
 *	order of the system. Updates the RGB properties.
 *
 * @param {Number} i - Integer representation of a color.
 * @returns {retro.Color}
 */
retro.Color.prototype.setInteger = function(i) {

	//i = i|0;

	var c = this.int2rgb(i);

	this.int32 = i;
	this.r = c[0];
	this.g = c[1];
	this.b = c[2];

	return this;
};

/**
 * Convert RGB values into an unsigned integer based on byte-order.
 * On a MSB system (big endian) the order will be RRGGBBAA and for
 * LSB (little endian) AABBGGRR (each char representing an octet).
 *
 * @type {Function}
 * @private
 */
retro.Color.prototype.rgb2int = retro._isLSB ?
	function(r, g, b) {
		return 0xff000000 + (b << 16) + (g << 8) + r;
	}
	:
	function(r, g, b) {
		return (r << 24) + (g << 16) + (b << 8) + 0xff;
	};

/**
 * Convert RGB values into an unsigned integer based on byte-order.
 * On a MSB system (big endian) the order of the integer must be
 * given as RRGGBBAA and for LSB (little endian) AABBGGRR
 * (each char representing an octet).
 *
 * @param {Number} i - integer value to convert
 * @private
 */
retro.Color.prototype.int2rgb = retro._isLSB ?
	function(i) {

		var r = (i & 0xff),
			g = (i & 0xff00) >> 8,
			b = (i & 0xff0000) >> 16;

		return [r, g, b];
	}
	:
	function(i) {

		var b = (i & 0xff00) >> 8,
			g = (i & 0xff0000) >> 16,
			r = (i & 0xff000000) >> 24;

		return [r, g, b];
	};

/**
 * Returns the current RGB values as an Array.
 *
 * @returns {Array} Array with index 0 = red, 1 = green, 2 = blue
 */
retro.Color.prototype.toArray = function() {
	return [this.r, this.g, this.b];
};

/**
 * Returns the current RGB values as an integer value. The returned
 * value is in the same byte-order format as the system.
 *
 * @returns {Number} 32-bits integer representing current color
 */
retro.Color.prototype.toInt = function() {
	return this.int32;
	//return this.rgb2int(this.r, this.g, this.b);
};

/**
 * Formats the current RGB values as a simple object with properties
 * r, g, b holding the value for each component.
 *
 * @returns {{r: Number, g: Number, b: Number}}
 */
retro.Color.prototype.toObject = function() {
	return {
		r: this.r,
		g: this.g,
		b: this.b
	}
};

/**
 * Formats the current RGB values as a comma-separated string.
 *
 * @returns {string} Simple comma-separated string
 */
retro.Color.prototype.toString = function() {
	return this.r + ',' + this.g + ',' + this.b;
};

/**
 * Formats the current RGB values as a string suitable for use
 * with CSS and 2D context.
 *
 * @returns {string} CSS style compatible string
 */
retro.Color.prototype.toStyle = function() {
	return 'rgb(' + this.r + ',' + this.g + ',' + this.b + ')';
};

/**
 * Returns an object with min and max properties containing new
 * retro.Color objects adjusted for tolerance. Tolerance is a
 * fraction of 255 which is subtracted and added to the new
 * objects respectively. The values will in any case be maxed at 255
 * and never be less than 0.
 *
 * @param {Number} tol - Tolerance in the range [0.0, 1.0]
 * @returns {{min: retro.Color, max: retro.Color}}
 */
retro.Color.prototype.getToleranceRange = function(tol) {

	var c1, c2, i = 0;

	c1 = [this.r, this.g, this.b];
	c2 = [this.r, this.g, this.b];

	for(; i < 3; i++) {
		c1[i] -= (255 * tol + 0.5)|0;
		c2[i] += (255 * tol + 0.5)|0;

		if (c1[i] < 0) c1[i] = 0;
		if (c2[i] > 255) c2[i] = 255;
	}

	return {
		min: new retro.Color(c1[0], c1[2], c1[3]),
		max: new retro.Color(c2[0], c2[2], c2[3])
	}
};

//private
retro.Color.prototype.update = function() {
	this.int32 = this.rgb2int(this.r, this.g, this.b);
};
