var gameApp = angular.module('gameApp');

gameApp.service('audioData', function() {
		
	this.audio = [
		{ 'src': 'audio/come-come-ye-saints.mp3' },
		{ 'src': 'audio/pioneer-children-sang-as-they-walked.mp3' },
		{ 'src': 'audio/the-handcart-song.mp3' },
		{ 'src': 'audio/the-oxcart.mp3' },
		{ 'src': 'audio/to-be-a-pioneer.mp3' }
	];
	
});