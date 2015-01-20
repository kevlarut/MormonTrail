var gameApp = angular.module('gameApp');

gameApp.service('userInterfaceService', function(userInterfaceData) {

	this.haltForInput = function(callback) {		
		userInterfaceData.inputCallback = callback;
		userInterfaceData.animating = false;
	}
	
});