var gameApp = angular.module('gameApp');

gameApp.service('userInterfaceData', function() {

	this.animating = true;
	this.inputCallback = null;
	this.modal = null;	
	this.context = null;
	this.canvasWidth = 0;
	this.BLACK_INDEX = 0;
	this.WHITE_INDEX = 15;
	this.screen = 'TRAVEL';
	
});