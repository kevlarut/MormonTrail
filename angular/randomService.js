var gameApp = angular.module('gameApp');

gameApp.service('randomService', function(partyData) {

	this.random = function(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}
	
	this.getLivingPartyMember = function() {
		var index = this.random(0, partyData.party.length - 1);
		for (var i = index; i < partyData.party.length; i++) {
			if (partyData.party[i].alive) {
				return partyData.party[i];
			}
		}
		for (var i = 0; i < index; i++) {
			if (partyData.party[i].alive) {
				return partyData.party[i];
			}
		}
	}
	
});