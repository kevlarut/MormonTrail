var gameApp = angular.module('gameApp');

gameApp.service('partyData', function() {

	this.party = [
		{ name: 'Brigham', diseases: [] },
		{ name: 'Mary', diseases: [] },
		{ name: 'Joseph', diseases: [] },
		{ name: 'Ezekiel', diseases: [] },
		{ name: 'Emma', diseases: [] }
	];
	
});