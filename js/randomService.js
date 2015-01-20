var gameApp = angular.module('gameApp');

gameApp.service('randomService', function() {

	this.random = function(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}
	
});