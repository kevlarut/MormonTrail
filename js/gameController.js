var gameApp = angular.module('gameApp');

gameApp.controller('gameController', ['$scope', '$timeout', function($scope, $timeout) {
 
	$scope.lastUpdated = new Date();

	$scope.animationIndex = 0;
	$scope.context = null;
	$scope.canvasWidth = 0;	
	
	$scope.odometer = 0;		
	$scope.screen = 'TRAVEL';
	
	$scope.wagonImage1 = null;
	$scope.wagonImage2 = null;
	$scope.emigrationCanyonImage = null;
	$scope.audio = [
		{ 'src': 'audio/come-come-ye-saints.mp3' },
		{ 'src': 'audio/pioneer-children-sang-as-they-walked.mp3' },
		{ 'src': 'audio/the-handcart-song.mp3' },
		{ 'src': 'audio/the-oxcart.mp3' },
		{ 'src': 'audio/to-be-a-pioneer.mp3' }
	];
		
	$scope.clearCanvas = function() {
		$scope.context
			.clear()
			.bgIndex(0);
	}
	
    $scope.drawTextAtLine = function (text, line) {
		var ctx = $scope.context;
		ctx	
			.fillIndex(0)
			.font('c64')
			.textAlign('center')
			.penColor(255,255,255)
			.text(text, $scope.canvasWidth, 8*line);
    };
		
	$scope.drawWagon = function() {	
		if ($scope.animationIndex === 0) {
			$scope.context.drawImage($scope.wagonImage1, 200, 40);
		}
		else {
			$scope.context.drawImage($scope.wagonImage2, 200, 40);
		}
	}
	
	$scope.getAudioBySrc = function(src) {
		for (var i = 0; i < $scope.audio.length; i++) {
			var song = $scope.audio[i];
			if (song.src === src) {
				return song;
			}
		}
		return null;
	}
	
	$scope.playAudio = function(src) {
		var song = $scope.getAudioBySrc(src);
		if (typeof song.element == 'undefined') {					
			console.log('ERROR: Audio ' + src + ' has not been loaded yet!');
		}
		else {
			song.element.currentTime = 0;
			song.element.play();
		}
	}
	
	$scope.loadAudio = function() {	
		for (var i = 0; i < $scope.audio.length; i++) {
			var song = $scope.audio[i];
			var element = document.createElement('audio');
			element.preload = 'auto';
			element.audioId = song.src;
			element.addEventListener('canplay', function() {
				var song = $scope.getAudioBySrc(this.audioId);
				song.element = this;
			}, false);
			element.src = song.src;
		}
	}
	
	$scope.loadImages = function(onload) {
		$scope.wagonImage1 = new Image;
		$scope.wagonImage1.crossOrigin = '';
		//$scope.wagonImage1.onload = onload;
		$scope.wagonImage1.src = 'img/handcart1.gif';
		
		$scope.wagonImage2 = new Image;
		$scope.wagonImage2.crossOrigin = '';
		//$scope.wagonImage2.onload = onload;
		$scope.wagonImage2.src = 'img/handcart2.gif';
		
		$scope.emigrationCanyonImage = new Image;
		$scope.emigrationCanyonImage.crossOrigin = '';
		$scope.emigrationCanyonImage.onload = onload;
		$scope.emigrationCanyonImage.src = 'img/emigration-canyon.gif';
	}
	
	$scope.drawLandscape = function() {
		$scope.context.penColor(null);
		$scope.context.fillColor(38, 195,18);
		$scope.context.rect(0, 67, 280, 20);
	}
	
	$scope.renderWalkingScreen = function() {
		$scope.drawTextAtLine('The Mormon Trail', 1);
		$scope.drawTextAtLine('Miles traveled: ' + $scope.odometer + ' miles', 21);
		$scope.drawLandscape();
		$scope.drawWagon();		
	}
	
	$scope.renderScenery = function() {
	
		var image = $scope.emigrationCanyonImage;
		$scope.context
			.drawImage(image, 0, 0, 280, 160, 'palette-fs');
		$scope.drawTextAtLine('This is the place!', 21);
		
		$scope.drawTextAtLine('Congratulations!  You have', 10);
		$scope.drawTextAtLine('made it to the Salt Lake valley.', 10);		
	}
	
	$scope.render = function() {
		$scope.clearCanvas();
		
		switch ($scope.screen) {
			case 'TRAVEL':
				$scope.renderWalkingScreen();
				break;
			case 'VICTORY':
			default:
				$scope.renderScenery();
				break;
		}
	}
	
	$scope.playARandomTrailSong = function() {
		var randomIndexExceptVictorySong = Math.floor(Math.random() * ($scope.audio.length - 1)) + 1;
		$scope.playAudio($scope.audio[randomIndexExceptVictorySong].src);
	}
	
	$scope.ensureThatASongIsPlaying = function() {
		for (var i = 0; i < $scope.audio.length; i++) {
			var song = $scope.audio[i];			
			if (typeof song.element != 'undefined' && song.element.currentTime != 0 && song.element.currentTime < song.element.duration) {
				return;
			}
		}
		
		$scope.playARandomTrailSong();
	}
	
	$scope.stopAllAudio = function() {
		for (var i = 0; i < $scope.audio.length; i++) {
			var song = $scope.audio[i];
			if (typeof song.element != 'undefined') {
				song.element.pause();
				song.element.currentTime = 0;
			}
		}		
	}
	
	$scope.update = function() {
		var framesPerSecond = 2;
		
		var now = new Date();
		var timeSinceLastUpdate = now.getTime() - $scope.lastUpdated.getTime();

		if ($scope.screen == 'TRAVEL') {
			$scope.ensureThatASongIsPlaying();
			$scope.odometer += 10;
		
			if ($scope.odometer >= 1300) {
				$scope.screen = 'VICTORY';
				$scope.stopAllAudio();
				$scope.playAudio('audio/come-come-ye-saints.mp3');
			}
		}
		
		$scope.render();
		
		if ($scope.animationIndex == 0) {
			$scope.animationIndex = 1;
		}
		else {
			$scope.animationIndex = 0;
		}
		
		$scope.lastUpdated = now;		
		$timeout($scope.update, 1000 / framesPerSecond);
	}
	
	$scope.init = function() {	
		var canvas = document.getElementById('game');
		var ctx = canvas.getContext('retro');
		
		$scope.context = ctx;
		
		var res = ctx.resolution(),
		w = res.width,
		h = res.height,
		canvasWidth = (w * 0.5)|0;
		$scope.canvasWidth = canvasWidth;
		
		$scope.loadAudio();
		$scope.loadImages(function() {
			ctx
				.palette('APPLEII')
				.addFonts([fontC64, fontRetroBig], $scope.update, function() { console.log('A font is missing...'); });
		});
	}
	
	$scope.init();	
	
}]);