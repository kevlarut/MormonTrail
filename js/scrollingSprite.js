scrollingSprite.prototype = new sprite();
scrollingSprite.prototype.constructor = scrollingSprite;
function scrollingSprite() {
	this.startingX = 0;
	this.x = 0;
	
	this.render = function(context, x, y) {
		var width = this.frameImages[0].width;
		sprite.prototype.render.call(this, context, x + this.x, y);
		sprite.prototype.render.call(this, context, x + this.x - width, y);		
	}
	
	this.update = function() {
		var width = this.frameImages[0].width;
		this.x += 10;
		if (this.x > width) {
			this.x = 0;
		}
		sprite.prototype.update();
	}	
}