var loadingScreen = new function() {	

	var _canvas = null;
	var _context = null;
	var _sprites = null;	
	
	var _self = this;
	var _interval = null;
	
	this.loop = function() {
		var horizontalCenter = _canvas.width / 2;
		var verticalCenter = _canvas.height / 2;
		
		_context.clearRect(0, 0, _canvas.width, _canvas.height);
		_context.textAlign = 'center';
		_context.font = "8px 'Here Lies MECC'";
		_context.fillStyle = 'white';		
		_context.fillText('Loading...', horizontalCenter, 70);
		
		var seagull = _sprites['seagull'];
		if (seagull.hasLoaded()) {
			seagull.render(_context, horizontalCenter - 32, verticalCenter - 32);
			seagull.update();
		}		
	}
	
	this.end = function() {
		clearInterval(_interval);
	}
	
	this.start = function(canvas, context, sprites) {	
		_canvas = canvas;
		_context = context;
		_sprites = sprites;
	
		_interval = setInterval(function() { _self.loop(); }, 200);
	}
}