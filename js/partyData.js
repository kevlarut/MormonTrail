var gameApp = angular.module('gameApp');

gameApp.service('partyData', function() {

	this.party = [
		{ name: 'Brigham', diseases: [], alive: true },
		{ name: 'Mary', diseases: [], alive: true },
		{ name: 'Joseph', diseases: [], alive: true },
		{ name: 'Ezekiel', diseases: [], alive: true },
		{ name: 'Emma', diseases: [], alive: true }
	];
	
});