function sprite() {
	this.animationIndex = 0;
	this.frameImages = [];
	
	this.preLoadImages = function(frameSources, callback) {
		for (var i = 0; i < frameSources.length; i++) {
			var image = new Image;
			image.onload = callback;
			image.src = frameSources[i];
			this.frameImages.push(image);
		}
	}
}
	
sprite.prototype.render = function(context, x, y) {
	var image = this.frameImages[this.animationIndex];
	context.drawImage(image, x, y);
}

sprite.prototype.update = function() {
	if (this.hasOwnProperty('frameImages')) {
		this.animationIndex++;
		if (this.animationIndex >= this.frameImages.length) {
			this.animationIndex = 0;
		}
	}
}