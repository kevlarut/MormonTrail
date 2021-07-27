var ponderScreen = new function() {
    var canvas = null;
    var context = null;
    var callback = null;
	var self = this;

    this.start = function(canvas, context, callback) {
        this.canvas = canvas;
        this.context = context;
        this.callback = callback;
	
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		
		this.context.textAlign = 'left';
		this.context.font = "8px 'Here Lies MECC'";					
		this.context.fillStyle = 'white';
		
		this.context.fillText("You may:", 10, 10);
		this.context.fillText("1. Continue on the trail", 20, 30);
		this.context.fillText("What is your choice?", 10, 180);

		window.document.onkeydown = function(event) {
			switch (event.keyCode) {
				case keyboard.ONE:
					window.document.onkeydown = null;
					self.end();
					break;
			}
		}
	}
    
    this.end = function() {
        this.callback();
    }
}