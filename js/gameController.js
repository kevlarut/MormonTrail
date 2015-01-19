var gameApp = angular.module('gameApp');

gameApp.controller('gameController', ['$scope', '$timeout', 'landmarkData', function($scope, $timeout, landmarkData) {
 
	$scope.lastUpdated = new Date();

	$scope.animating = true;
	$scope.animationIndex = 0;
	$scope.context = null;
	$scope.canvasWidth = 0;	

	$scope.BLACK_INDEX = 0;
	$scope.WHITE_INDEX = 15;
	
	$scope.date = new Date(1847, 4, 5);
	$scope.weather = 'warm';
	$scope.food = 0;
	$scope.modal = null;
	$scope.roadometer = 0;		
	$scope.screen = 'TRAVEL';
	
	$scope.inputCallback = null;
	$scope.inputBuffer = '';
	
	$scope.party = [
		{ name: 'Brigham' },
		{ name: 'Mary' },
		{ name: 'Joseph' },
		{ name: 'Ezekiel' },
		{ name: 'Emma' }
	];
	
	$scope.wagonImage1 = null;
	$scope.wagonImage2 = null;
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
	
	$scope.getHealth = function() {
		var partySize = $scope.party.length;
		var sickMembers = 0;
		for (var i = 0; i < partySize; i++) {
			var person = $scope.party[i];
			if (person.disease) {
				sickMembers++;
			}
		}
		
		var healthyMembers = partySize - sickMembers;		
		switch (healthyMembers) {
			case 1:
				return 'very poor';
				break;
			case 2:
				return 'poor';
				break;
			case 3:
				return 'fair';
				break;
			case 4:
				return 'good';
				break;
			default:
				return 'very good';
				break;
		}
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
	
	$scope.loadImage = function(src) {
		var image = new Image;
		image.src = src;
		return image;
	}
	
	$scope.loadImages = function(onload) {
		$scope.wagonImage1 = new Image;
		$scope.wagonImage1.crossOrigin = '';
		//$scope.wagonImage1.onload = onload;
		$scope.wagonImage1.src = 'img/handcart1.gif';
		
		$scope.wagonImage2 = new Image;
		$scope.wagonImage2.crossOrigin = '';
		$scope.wagonImage2.onload = onload;
		$scope.wagonImage2.src = 'img/handcart2.gif';
		
		$scope.grassImage = $scope.loadImage('img/grass.gif');
		$scope.plainsBackgroundImage = $scope.loadImage('img/plains-background.gif');
		
		$scope.context.drawImage($scope.grassImage, 0, 88);
		$scope.context.drawImage($scope.plainsBackgroundImage, 0, 0);
		
		for (var i = 0; i < landmarkData.landmarks.length; i++) {
			var landmark = landmarkData.landmarks[i];
			var image = new Image;
			image.onload = null;
			image.src = landmark.src;			
			landmark.image = image;
		}
	}
	
	$scope.getNextLandmark = function() {
		for (var i = 0; i < landmarkData.landmarks.length; i++) {
			var landmark = landmarkData.landmarks[i];
			if ($scope.roadometer <= landmark.miles) {
				return landmark;
			}
		}
		return null;
	}
	
	$scope.milesToNextLandmark = function() {
		var landmark = $scope.getNextLandmark();
		if (landmark != null) {
			return landmark.miles - $scope.roadometer;
		}	
		return 0;
	}
	
	$scope.drawPlainsBackground = function() {				
		$scope.context.drawImage($scope.grassImage, 0, 67);
		$scope.context.drawImage($scope.plainsBackgroundImage, 0, 20);
	}
	
	$scope.renderWalkingScreen = function() {
	
		$scope.context.penColor(null);
		$scope.context.fillColor(255, 255, 255);
		
		$scope.drawPlainsBackground();
		$scope.context.rect(0, 88, 280, 190);
		
		$scope.drawTextAtLine('The Mormon Trail', 1);
		
		var date = $scope.date.toDateString();
		var whiteLinesToDraw = [];
		whiteLinesToDraw.push({ label: 'Date: ', value: date});
		whiteLinesToDraw.push({ label: 'Weather: ', value: $scope.weather});
		whiteLinesToDraw.push({ label: 'Health: ', value: $scope.getHealth()});
		whiteLinesToDraw.push({ label: 'Food: ', value: $scope.food + ' pounds'});
		whiteLinesToDraw.push({ label: 'Next landmark: ', value: $scope.milesToNextLandmark() + ' miles'});
		whiteLinesToDraw.push({ label: 'Miles traveled: ', value: $scope.roadometer + ' miles'});
		
		for (var i = 0; i < whiteLinesToDraw.length; i++) {
			var line = whiteLinesToDraw[i];
			$scope.drawText(line.label, {background: $scope.WHITE_INDEX, foreground: $scope.BLACK_INDEX -1, line: 16 + i, textAlign: 'right' });
			$scope.drawText(line.value, {background: $scope.WHITE_INDEX, foreground: $scope.BLACK_INDEX -1, line: 16 + i, textAlign: 'left' });
		}
		
		$scope.drawWagon();
	}
	
	$scope.showSceneForCurrentLandmark = function() {
		$scope.modal = null;
		$scope.screen = 'LANDMARK';
		$scope.inputCallback = 'returnToWalking';
	}
	
	$scope.renderLandmarkScreen = function() {
	
		var landmark = $scope.getNextLandmark();
	
		$scope.context
			.drawImage(landmark.image, 0, 0, 280, 160, 'palette-fs');
		$scope.drawTextAtLine(landmark.name, 21);
		$scope.drawTextAtLine($scope.date.toDateString(), 22);
		
		$scope.drawText('Press ENTER to continue', {background: $scope.WHITE_INDEX, foreground: $scope.BLACK_INDEX -1, line: 23 });
	}
	
	$scope.renderVictoryScreen = function() {
	
		var image = landmarkData.landmarks[landmarkData.landmarks.length - 1].image;
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
			case 'LANDMARK':
				$scope.renderLandmarkScreen();
				break;
			case 'VICTORY':
			default:
				$scope.renderVictoryScreen();
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
	
	$scope.random = function(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}
	
	$scope.playARandomTrailSong = function() {
		var randomIndexExceptVictorySong = $scope.random(1, $scope.audio.length - 1);
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
		$scope.screen = 'TRAVEL';
		$scope.animating = true;
		$scope.modal = null;
		$scope.roadometer++;
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
	
	$scope.haltForInput = function(callback) {		
		$scope.inputCallback = callback;
		$scope.animating = false;
	}
	
	$scope.inflictADiseaseOnSomeone = function(disease) {
		var index = $scope.random(0, $scope.party.length - 1);
		var person = $scope.party[index];
		if (typeof person.disease === 'undefined' || person.disease === null) {
			person.disease = disease;
			$scope.modal = person.name + ' has ' + disease + '.';
			$scope.haltForInput('returnToWalking');
		}
	}
	
	$scope.considerSpawningARandomEvent = function() {
		var roll = $scope.random(1, 100);
		switch (roll) {
			case 1: 
				$scope.inflictADiseaseOnSomeone('cholera');
				break;
			case 2:
			case 3:
				$scope.inflictADiseaseOnSomeone('mountain fever');
				break;
		}
	}
	
	$scope.advanceTheDay = function() {		
		$scope.date.setTime( $scope.date.getTime() + 1 * 86400000 );
		$scope.considerSpawningARandomEvent();
	}
	
	$scope.update = function() {
		var framesPerSecond = 2;
		
		var now = new Date();
		var timeSinceLastUpdate = now.getTime() - $scope.lastUpdated.getTime();

		if ($scope.screen == 'TRAVEL') {
			$scope.ensureThatASongIsPlaying();
		
			if ($scope.animating) {
				var landmark = $scope.getNextLandmark();
				if ($scope.roadometer >= landmark.miles) {
					$scope.roadometer = landmark.miles;
		
					if (landmark.name == 'Salt Lake Valley') {
						$scope.screen = 'VICTORY';
						$scope.stopAllAudio();
						$scope.playAudio('audio/come-come-ye-saints.mp3');
					}
					else {
						$scope.modal = 'You are now at ' + landmark.name + '. Would you like to look around?';
						$scope.haltForInput('handleInputForViewLandmarkOrReturnToTravel');
					}
				}
				else {
				
					$scope.advanceTheDay();
				
					var distanceToNextLandmark = landmark.miles - $scope.roadometer;
					$scope.roadometer += distanceToNextLandmark < 10 ? distanceToNextLandmark : 10;
				}
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