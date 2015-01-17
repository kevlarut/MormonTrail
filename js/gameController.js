var gameApp = angular.module('gameApp');

gameApp.controller('gameController', ['$scope', '$timeout', function($scope, $timeout) {
 
	$scope.lastUpdated = new Date();

	$scope.animating = true;
	$scope.animationIndex = 0;
	$scope.context = null;
	$scope.canvasWidth = 0;	

	$scope.BLACK_INDEX = 0;
	$scope.WHITE_INDEX = 15;
	
	$scope.date = 'July 24, 1847';
	$scope.weather = 'warm';
	$scope.health = 'good';
	$scope.food = 0;
	$scope.modal = null;
	$scope.odometer = 0;		
	$scope.screen = 'TRAVEL';
	
	$scope.inputCallback = null;
	$scope.inputBuffer = '';
	
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
	
	$scope.landmarks = [
		{
			name: 'Sugar Creek',
			miles: 7
		},		
		{
			name: 'Winter Quarters',
			miles: 266
		},		
		{
			name: 'Fort Laramie',
			miles: 788
		},		
		{
			name: 'Martin\'s Cove',
			miles: 993
		},		
		{
			name: 'Echo Canyon',
			miles: 1246
		},		
		{
			name: 'Salt Lake Valley',
			miles: 1297
		}
	];
		
	$scope.clearCanvas = function() {
		$scope.context
			.clear()
			.bgIndex(0);
	}
	
	$scope.drawText = function(text, options) {
		var backgroundColorIndex = options.background || $scope.BLACK_INDEX;
		var font = 'c64';
		var textAlign = options.textAlign || 'center';
		var foregroundColorIndex = (options.foreground || $scope.WHITE_INDEX);
		var characterHeight = 8;
		var line = options.line || 0;
		var y = characterHeight * line;
		
		$scope.context
			.fillIndex(backgroundColorIndex)
			.font(font)
			.textAlign(textAlign)
			.penIndex(foregroundColorIndex)
			.text(text, $scope.canvasWidth, y);
			
	}
	
    $scope.drawTextAtLine = function (text, line) {	
		$scope.drawText(text, { line: line });
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
	
	$scope.getNextLandmark = function() {
		for (var i = 0; i < $scope.landmarks.length; i++) {
			var landmark = $scope.landmarks[i];
			if ($scope.odometer <= landmark.miles) {
				return landmark;
			}
		}
		return null;
	}
	
	$scope.milesToNextLandmark = function() {
		var landmark = $scope.getNextLandmark();
		if (landmark != null) {
			return landmark.miles - $scope.odometer;
		}	
		return 0;
	}
	
	$scope.renderWalkingScreen = function() {
	
		$scope.context.penColor(null);
		$scope.context.fillColor(255, 255, 255);
		$scope.context.rect(0, 88, 280, 190);
		
		$scope.drawTextAtLine('The Mormon Trail', 1);
		
		var whiteLinesToDraw = [];
		whiteLinesToDraw.push({ label: 'Date: ', value: $scope.date});
		whiteLinesToDraw.push({ label: 'Weather: ', value: $scope.weather});
		whiteLinesToDraw.push({ label: 'Health: ', value: $scope.health});
		whiteLinesToDraw.push({ label: 'Food: ', value: $scope.food + ' pounds'});
		whiteLinesToDraw.push({ label: 'Next landmark: ', value: $scope.milesToNextLandmark() + ' miles'});
		whiteLinesToDraw.push({ label: 'Miles traveled: ', value: $scope.odometer + ' miles'});
		
		for (var i = 0; i < whiteLinesToDraw.length; i++) {
			var line = whiteLinesToDraw[i];
			$scope.drawText(line.label, {background: $scope.WHITE_INDEX, foreground: $scope.BLACK_INDEX -1, line: 16 + i, textAlign: 'right' });
			$scope.drawText(line.value, {background: $scope.WHITE_INDEX, foreground: $scope.BLACK_INDEX -1, line: 16 + i, textAlign: 'left' });
		}
		
		$scope.drawLandscape();
		$scope.drawWagon();
	}
	
	$scope.showSceneForCurrentLandmark = function() {
		console.log('ERROR: showSceneForCurrentLandmark is NotImplemented!');
		$scope.returnToWalking();
	}
	
	$scope.renderScenery = function() {
	
		var image = $scope.emigrationCanyonImage;
		$scope.context
			.drawImage(image, 0, 0, 280, 160, 'palette-fs');
		$scope.drawTextAtLine('This is the place!', 21);
		
		$scope.modal = 'Congratulations!  You have made it to the Salt Lake valley.';
	}
	
	$scope.wordWrap = function(text) {
		
		var width = 25;
		
		if (!text) { 
			return text; 
		}
	 
		var regex = '.{1,' + width + '}(\\s|$)|\\S+?(\\s|$)';
	 
		var lines = text.match( RegExp(regex, 'g') );
		
		return lines;
		
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
		
		if ($scope.modal != null) {		
			var text = $scope.modal;
			var lines = $scope.wordWrap(text);
			
			$scope.context.penColor(255,255,255);
			$scope.context.fillColor(0,0,0);
			$scope.context.rect(35, 75, 210, 10 + (8*lines.length));
		
			for (var i = 0; i < lines.length; i++) {
				$scope.drawTextAtLine(lines[i], 10+i);					
			}
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
	
	$scope.returnToWalking = function() {
		$scope.animating = true;
		$scope.modal = null;
		$scope.odometer++;
	}
	
	$scope.handleInputForViewLandmarkOrReturnToTravel = function(input) {
		console.log('handleInputForViewLandmarkOrReturnToTravel was called with input ' + input);
		
		if (input == 'Y' || input == 'YES') {
			$scope.showSceneForCurrentLandmark();
		}
		else {
			$scope.returnToWalking();
		}
	}
	
	$scope.keyup = function(event) {
		var KEYCODE_ENTER = 13;
		if (event.keyCode == KEYCODE_ENTER) {
			$scope[$scope.inputCallback]($scope.inputBuffer);
			$scope.inputBuffer = '';
		}
		else {
			$scope.inputBuffer += String.fromCharCode(event.keyCode);
		}
	}
	
	$scope.update = function() {
		var framesPerSecond = 2;
		
		var now = new Date();
		var timeSinceLastUpdate = now.getTime() - $scope.lastUpdated.getTime();

		if ($scope.screen == 'TRAVEL') {
			$scope.ensureThatASongIsPlaying();
		
			var landmark = $scope.getNextLandmark();
			if ($scope.odometer >= landmark.miles) {
				$scope.odometer = landmark.miles;
	
				if (landmark.name == 'Salt Lake Valley') {
					$scope.screen = 'VICTORY';
					$scope.stopAllAudio();
					$scope.playAudio('audio/come-come-ye-saints.mp3');
				}
				else {
					$scope.modal = 'You are now at ' + landmark.name + '. Would you like to look around?';
					$scope.inputCallback = 'handleInputForViewLandmarkOrReturnToTravel';
					$scope.animating = false;
				}
			}
			else {
				var distanceToNextLandmark = landmark.miles - $scope.odometer;
				$scope.odometer += distanceToNextLandmark < 10 ? distanceToNextLandmark : 10;
			}
		}
		
		$scope.render();
		
		if ($scope.animating) {
			if ($scope.animationIndex == 0) {
				$scope.animationIndex = 1;
			}
			else {
				$scope.animationIndex = 0;
			}
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