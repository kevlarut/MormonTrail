/**
 * A simple point object which enforces integer values. It has some
 * handy methods to perform transforms (we couldn't resist..).
 *
 * @class Point
 * @param {Number} x - x position
 * @param {Number} y - y position
 * @constructor
 */
retro.Point = function(x, y) {

	this.x = (x + 0.5)|0;
	this.y = (y + 0.5)|0;

};

/**
 * Translates and returns a new point. Enforces result to integer values.
 *
 * @param {Number} dx - amount of pixels in x direction
 * @param {Number} dy - amount of pixels in y direction
 * @returns {retro.Point}
 */
retro.Point.prototype.translate = function(dx, dy) {
	this.x = (this.x + dx + 0.5)|0;
	this.y = (this.y + dy + 0.5)|0;
	return this;
};

/**
 * Scales the point. Enforces result to integer values.
 * A value of 1 doesn't change anything.
 *
 * @param {Number} sx - amount of scale in x direction
 * @param {Number} sy - amount of scale in y direction
 * @returns {retro.Point}
 */
retro.Point.prototype.scale = function(sx, sy) {
	this.x = (this.x * sx + 0.5)|0;
	this.y = (this.y * sy + 0.5)|0;
	return this;
};

/**
 * Add another point's x and y to this point.
 *
 * @param {retro.Point} point
 * @returns {retro.Point}
 */
retro.Point.prototype.add = function(point) {
	this.x += point.x;
	this.y += point.y;
	return this;
};

/**
 * Multiplies another point's x and y to this point.
 *
 * @param {retro.Point} point
 * @returns {retro.Point}
 */
retro.Point.prototype.mul = function(point) {
	this.x *= point.x;
	this.y *= point.y;
	return this;
};

/**
 * Divides another point's x and y to this point.
 *
 * @param {retro.Point} point
 * @returns {retro.Point}
 */
retro.Point.prototype.div = function(point) {
	if (point.x !== 0) this.x /= point.x;
	if (point.y !== 0) this.y /= point.y;
	return this;
};
