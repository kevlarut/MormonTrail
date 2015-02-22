/*
 *	requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish, Tino Zijdel.
 *	MIT license
 */
(function() {
	var lastTime = 0,
		vendors = ['webkit', 'moz', 'ms', 'o'], v, x = 0;

	for(; v = vendors[x] && !window.requestAnimationFrame; x++) {
		window.requestAnimationFrame = window[v+'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[v+'CancelAnimationFrame'] || window[v+'CancelRequestAnimationFrame'];
	}

	if (!window.requestAnimationFrame)
		window.requestAnimationFrame = function(callback) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function() { callback(currTime + timeToCall); },	timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};

	if (!window.cancelAnimationFrame)
		window.cancelAnimationFrame = function(id) { clearTimeout(id) };
}());


/******  Patches and extensions  *******/

/*
 *	This canvas extension allow this use:
 *
 *		var retro = canvas.getContext('retro');
 *
 *	@private
 */
window.HTMLCanvasElement.prototype.z___RETRO___gc_vector = window.HTMLCanvasElement.prototype.getContext;
window.HTMLCanvasElement.prototype.getContext = function(type) {

	if (type.toLowerCase() === 'retro') {
		return new retro.Context(this);
	}

	return this.z___RETRO___gc_vector(type);
};
