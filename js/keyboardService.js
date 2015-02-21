var gameApp = angular.module('gameApp');

gameApp.service('keyboardService', function(gameState, gameStateService, userInterfaceData) {
	
	this.handleKeyboardInput = function(key) {
	
		var KEYCODE_ENTER = 13;
		if (key == KEYCODE_ENTER) {
			var func = gameStateService[userInterfaceData.inputCallback];
			if (func) {
				func(userInterfaceData.inputBuffer);
				userInterfaceData.inputBuffer = '';
			}
		}
		else {
			userInterfaceData.inputBuffer += String.fromCharCode(key);
		}
		
	}
	
});