var gameApp = angular.module('gameApp');

gameApp.service('gameStateService', function(userInterfaceData, gameState) {
	
	var that = this;
	
	this.handleInputForViewLandmarkOrReturnToTravel = function(input) {
		console.log('handleInputForViewLandmarkOrReturnToTravel was called with input ' + input);
		
		if (input == 'Y' || input == 'YES') {
			showSceneForCurrentLandmark();
		}
		else {
			that.returnToWalking();
		}
	}	
	
	this.returnToWalking = function() {
		userInterfaceData.screen = 'TRAVEL';
		userInterfaceData.animating = true;		
		userInterfaceData.modal = null;
		gameState.roadometer++;
		userInterfaceData.inputCallback = 'sizeUpTheSituation';
	}
	
	var showSceneForCurrentLandmark = function() {
		userInterfaceData.modal = null;
		userInterfaceData.screen = 'LANDMARK';
		userInterfaceData.inputCallback = 'returnToWalking';
	}
	
	this.sizeUpTheSituation = function() {
		console.log('ERROR: sizeUpTheSituation is not implemented.');
	}
	
});