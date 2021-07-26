var gameApp = angular.module('gameApp');

gameApp.service('deathService', function(partyData, randomService, userInterfaceData, userInterfaceService) {

	this.killPerson = function(person, cause) {
		if (person.alive) {		
			person.alive = false;
			userInterfaceData.modal = person.name + ' has died of ' + cause + '.';
			userInterfaceService.haltForInput('returnToWalking');				
		}
		else {
			console.error('ERROR: This person is already dead and cannot be killed twice.');
		}
		
		for (var i = 0; i < partyData.party.length; i++) {
			if (partyData.party[i].alive) {
				return;
			}
		}
		
		userInterfaceData.screen = 'DEFEAT';
	}
	
});