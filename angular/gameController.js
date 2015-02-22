var gameApp = angular.module('gameApp');

gameApp.controller('gameController', ['$scope', '$timeout', 'audioData', 'landmarkData', 'partyData', 'userInterfaceData', 'healthService', 'randomService', 'userInterfaceService', 'deathService', 'gameState', 'imageData', 'keyboardService', function($scope, $timeout, audioData, landmarkData, partyData, userInterfaceData, healthService, randomService, userInterfaceService, deathService, gameState, imageData, keyboardService) {
 
	$scope.lastUpdated = new Date();

	$scope.animationIndex = 0;
		
	$scope.isSoundEnabled = false;
		
	$scope.date = new Date(1847, 4, 5);
	$scope.weather = 'warm';
	$scope.food = 1000;
	
	// 1lbs per day is bare bones
	// 2lbs per day is meager		
	// 3lbs per day is filling
	$scope.dailyRation = 3;
	
	$scope.wagonImage1 = null;
	$scope.wagonImage2 = null;	

	$scope.clearCanvas = function() {
		userInterfaceData.context
			.clear()
			.bgIndex(0);
	}
				
	$scope.drawWagon = function() {	
		if ($scope.animationIndex === 0) {
			userInterfaceData.context.drawImage($scope.wagonImage1, 200, 40);
		}
		else {
			userInterfaceData.context.drawImage($scope.wagonImage2, 200, 40);
		}
	}
	
	$scope.getAudioBySrc = function(src) {
		for (var i = 0; i < audioData.audio.length; i++) {
			var song = audioData.audio[i];
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
		for (var i = 0; i < audioData.audio.length; i++) {
			var song = audioData.audio[i];
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
		
		imageData.grassImage = $scope.loadImage('img/grass.gif');
		imageData.plainsBackgroundImage = $scope.loadImage('img/plains-background.gif');
		
		userInterfaceData.context.drawImage(imageData.grassImage, 0, 88);
		userInterfaceData.context.drawImage(imageData.plainsBackgroundImage, 0, 0);
		
		for (var i = 0; i < landmarkData.landmarks.length; i++) {
			var landmark = landmarkData.landmarks[i];
			var image = new Image;
			image.onload = null;
			image.src = landmark.src;			
			landmark.image = image;
		}
		
		imageData.failureScreen = new Image;
		imageData.failureScreen.onload = null;
		imageData.failureScreen.src = 'img/defeat.gif';		
	}
	
	$scope.getNextLandmark = function() {
		for (var i = 0; i < landmarkData.landmarks.length; i++) {
			var landmark = landmarkData.landmarks[i];
			if (gameState.roadometer <= landmark.miles) {
				return landmark;
			}
		}
		return null;
	}
	
	$scope.milesToNextLandmark = function() {
		var landmark = $scope.getNextLandmark();
		if (landmark != null) {
			return landmark.miles - gameState.roadometer;
		}	
		return 0;
	}
	
	$scope.renderWalkingScreen = function() {
				
		userInterfaceData.context.penColor(null);
		userInterfaceData.context.fillColor(255, 255, 255);
		
		userInterfaceService.drawPlainsBackground();
		userInterfaceData.context.rect(0, 124, 280, 190);
		
		userInterfaceService.drawTextAtLine('The Mormon Trail', 1);		
		userInterfaceService.drawTextAtLine('Press ENTER to check the situation', 14);
		
		var date = $scope.date.toDateString();
		var health = healthService.getHealth();
		var whiteLinesToDraw = [];
		whiteLinesToDraw.push({ label: 'Date: ', value: date});
		whiteLinesToDraw.push({ label: 'Weather: ', value: $scope.weather});
		whiteLinesToDraw.push({ label: 'Health: ', value: health});
		whiteLinesToDraw.push({ label: 'Food: ', value: $scope.food + ' pounds'});
		whiteLinesToDraw.push({ label: 'Next landmark: ', value: $scope.milesToNextLandmark() + ' miles'});
		whiteLinesToDraw.push({ label: 'Roadometer: ', value: gameState.roadometer + ' miles'});
		
		for (var i = 0; i < whiteLinesToDraw.length; i++) {
			var line = whiteLinesToDraw[i];
			userInterfaceService.drawText(line.label, {background: userInterfaceData.WHITE_INDEX, foreground: userInterfaceData.BLACK_INDEX -1, line: 16 + i, textAlign: 'right' });
			userInterfaceService.drawText(line.value, {background: userInterfaceData.WHITE_INDEX, foreground: userInterfaceData.BLACK_INDEX -1, line: 16 + i, textAlign: 'left' });
		}
		
		$scope.drawWagon();
	}
	
	$scope.renderLandmarkScreen = function() {
	
		var landmark = $scope.getNextLandmark();
	
		userInterfaceData.context
			.drawImage(landmark.image, 0, 0, 280, 160, 'palette-fs');
		userInterfaceService.drawTextAtLine(landmark.name, 21);
		userInterfaceService.drawTextAtLine($scope.date.toDateString(), 22);
		
		userInterfaceService.drawText('Press ENTER to continue', {background: userInterfaceData.WHITE_INDEX, foreground: userInterfaceData.BLACK_INDEX -1, line: 23 });
	}
	
	$scope.renderVictoryScreen = function() {
	
		var image = landmarkData.landmarks[landmarkData.landmarks.length - 1].image;
		userInterfaceData.context
			.drawImage(image, 0, 0, 280, 160, 'palette-fs');
		userInterfaceService.drawTextAtLine('This is the place!', 21);
		
		userInterfaceData.modal = 'Congratulations!  You have made it to the Salt Lake valley.';
	}
	
	$scope.render = function() {
		$scope.clearCanvas();
		
		switch (userInterfaceData.screen) {
			case 'DEFEAT':
				userInterfaceService.renderDefeatScreen();
				break;
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
		
		userInterfaceService.renderModal();
	}
	
	$scope.playARandomTrailSong = function() {
		var randomIndexExceptVictorySong = randomService.random(1, audioData.audio.length - 1);
		$scope.playAudio(audioData.audio[randomIndexExceptVictorySong].src);
	}
	
	$scope.ensureThatASongIsPlaying = function() {
		for (var i = 0; i < audioData.audio.length; i++) {
			var song = audioData.audio[i];			
			if (typeof song.element != 'undefined' && song.element.currentTime != 0 && song.element.currentTime < song.element.duration) {
				return;
			}
		}
		
		$scope.playARandomTrailSong();
	}
	
	$scope.stopAllAudio = function() {
		for (var i = 0; i < audioData.audio.length; i++) {
			var song = audioData.audio[i];
			if (typeof song.element != 'undefined') {
				song.element.pause();
				song.element.currentTime = 0;
			}
		}		
	}
	
	$scope.keyup = function(event) {
		keyboardService.handleKeyboardInput(event.keyCode);
	}
	
	$scope.considerSpawningARandomEvent = function() {
		var roll = randomService.random(1, 100);
		switch (roll) {
			case 1: 
				healthService.inflictADiseaseOnSomeone('cholera');
				break;
			case 2:
				healthService.inflictADiseaseOnSomeone('dysentery');
				break;
			case 3:
			case 4:
				healthService.inflictADiseaseOnSomeone('mountain fever');
				break;
			case 5:
			case 6:
			case 7:
			case 8:
				healthService.healSomeone();
				break;
		}
	}
	
	$scope.starveSomeone = function() {	
		var person = randomService.getLivingPartyMember();	
		deathService.killPerson(person, 'starvation');
	}
	
	$scope.eatFood = function() {
		
		var livingMembersOfParty = partyData.party.length;
		for (var i = 0; i < partyData.party.length; i++) {
			var person = partyData.party[i];
			if (!person.alive) {
				livingMembersOfParty--;
			}
		}
		
		var dailyNutritionRequirement = livingMembersOfParty * $scope.dailyRation;
		$scope.food -= dailyNutritionRequirement;
		if ($scope.food < 0) {
			if (randomService.random(1, 10) == 1) {
				$scope.starveSomeone();
			}
			$scope.food = 0;			
		}
	} 
	
	$scope.advanceTheDay = function() {		
		$scope.date.setTime( $scope.date.getTime() + 1 * 86400000 );
		$scope.considerSpawningARandomEvent();
		$scope.eatFood();
	}
	
	$scope.update = function() {
		var framesPerSecond = 2;
		
		var now = new Date();
		var timeSinceLastUpdate = now.getTime() - $scope.lastUpdated.getTime();

		if (userInterfaceData.screen == 'TRAVEL') {
			if ($scope.isSoundEnabled) {
				$scope.ensureThatASongIsPlaying();
			}
		
			if (userInterfaceData.animating) {
				var landmark = $scope.getNextLandmark();
				if (gameState.roadometer >= landmark.miles) {
					gameState.roadometer = landmark.miles;
		
					if (landmark.name == 'Salt Lake Valley') {
						userInterfaceData.screen = 'VICTORY';
						$scope.stopAllAudio();
						$scope.playAudio('audio/come-come-ye-saints.mp3');
					}
					else {
						userInterfaceData.modal = 'You are now at ' + landmark.name + '. Would you like to look around?';
						userInterfaceService.haltForInput('handleInputForViewLandmarkOrReturnToTravel');
					}
				}
				else {
				
					$scope.advanceTheDay();
				
					var distanceToNextLandmark = landmark.miles - gameState.roadometer;
					gameState.roadometer += distanceToNextLandmark < 10 ? distanceToNextLandmark : 10;
				}
			}
		}
		
		$scope.render();
		
		if (userInterfaceData.animating) {
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
		
		userInterfaceData.context = ctx;
		
		var res = ctx.resolution(),
		w = res.width,
		h = res.height,
		canvasWidth = (w * 0.5)|0;
		userInterfaceData.canvasWidth = canvasWidth;
		
		$scope.loadAudio();
		$scope.loadImages(function() {
			ctx
				.palette('APPLEII')
				.addFonts([fontC64, fontRetroBig], $scope.update, function() { console.log('A font is missing...'); });
		});
	}
	
	$scope.init();	
	
}]);