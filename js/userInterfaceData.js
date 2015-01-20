var gameApp = angular.module('gameApp');

gameApp.service('userInterfaceData', function() {

	this.animating = true;
	this.inputCallback = null;
	this.modal = null;
	
});