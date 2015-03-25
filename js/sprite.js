function sprite() {
	this.animationIndex = 0;
	this.height = 0;
	this.width = 0;	
	this.frameImages = [];
	this.framesLoaded = 0;	
	
	var self = this;
	
	this.hasLoaded = function() {
		if (self.framesLoaded == self.frameImages.length) {
			return true;
		}
		else {
			return false;
		}
	}
	
	this.preLoadImages = function(frameSources, callback) {
		for (var i = 0; i < frameSources.length; i++) {		
			var image = new Image;
		
			if (i == 0) {
				image.onload = function() {
					self.height = this.height;
					self.width = this.width;
					self.framesLoaded++;
					callback();
				}
			}
			else {			
				image.onload = function() {
					self.framesLoaded++;
					callback;
				}
			}
			
			image.src = frameSources[i];
			self.frameImages.push(image);
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