var suppliesScreen = new function() {
    var canvas = null;
    var context = null;
    var callback = null;
	var sprites = null;
	var self = this;

    this.start = function(canvas, context, sprites, callback) {
        this.canvas = canvas;
        this.context = context;
        this.callback = callback;
		this.sprites = sprites;
	
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

		this.context.textAlign = 'left';
		this.context.font = "8px 'Here Lies MECC'";					
		this.context.fillStyle = 'white';		
		
		this.context.fillText("Your Supplies", 20, 10);

		this.context.fillText("Pounds of food", 20, 30);	
		this.context.fillText(Math.floor(inventory.food), 210, 30);

		for (var i = 0, cursor = 40; i < inventory.nonFoodInventory.length; i++, cursor += 10) {
			var item = inventory.nonFoodInventory[i];			
			this.context.fillText(item.name, 20, cursor);	
			this.context.fillText("1", 210, cursor);
		}

		this.context.fillText("Press ENTER to continue", 50, 183);

		window.document.onkeydown = function(event) {
			switch (event.keyCode) {
				case keyboard.ENTER:
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