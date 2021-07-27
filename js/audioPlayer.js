var audioPlayer = new function() {	
	this.stopAllAudio = function() {
		for (var i = 0; i < audioAssets.length; i++) {
			var song = audioAssets[i];
			song.element.pause();
			song.element.currentTime = 0;
		}
	}
}