scrollingSprite.prototype = new sprite();
scrollingSprite.prototype.constructor = scrollingSprite;
function scrollingSprite() {
	this.startingX = 0;
	this.x = [0,0,0];
	
	this.render = function(context, x, y) {
	
		for (var i = 0; i < this.frameImages.length; i++) {
			var image = this.frameImages[i];
			var width = image.width;
			var drawX = this.x[i];
			context.drawImage(image, x + this.x[i], y);
			context.drawImage(image, x + this.x[i] - width, y);			
		}
	
	}
	
	this.update = function() {
		var width = this.frameImages[0].width;
		for (var i = 0; i < this.x.length; i++) {	
			this.x[i] += (2 * (i + 1));
			if (this.x[i] > width) {
				this.x[i] = 0;
			}
		}
		sprite.prototype.update();
	}	
}