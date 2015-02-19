var gameApp = angular.module('gameApp');

gameApp.service('healthService', function(deathService, partyData, randomService, userInterfaceData, userInterfaceService) {

	this.getHealth = function() {
		var partySize = partyData.party.length;
		var sickMembers = 0;
		for (var i = 0; i < partySize; i++) {
			var person = partyData.party[i];
			if (person.diseases.length > 0) {
				sickMembers++;
			}
		}
		
		var healthyMembers = partySize - sickMembers;		
		switch (healthyMembers) {
			case 0:
				return 'almost dead';
				break;
			case 1:
				return 'very poor';
				break;
			case 2:
				return 'poor';
				break;
			case 3:
				return 'fair';
				break;
			case 4:
				return 'good';
				break;
			default:
				return 'very good';
				break;
		}
	}
	
	this.healSomeone = function() {
		var person = randomService.getLivingPartyMember();
		if (person.diseases.length > 0) {
			var disease = person.diseases[0];
			person.diseases.pop(disease);
			userInterfaceData.modal = person.name + ' no longer has ' + disease + '.';
			userInterfaceService.haltForInput('returnToWalking');			
		}
	}
	
	this.inflictADiseaseOnSomeone = function(disease) {
		var person = randomService.getLivingPartyMember();
		if (person.alive) {		
			for (var i = 0; i < person.diseases; i++) {
				if (person.diseases[i] == disease) {
					deathService.killPerson(person, disease);		
					return;
				}
			}
			
			person.diseases.push(disease);
			userInterfaceData.modal = person.name + ' has ' + disease + '.';
			userInterfaceService.haltForInput('returnToWalking');
		}
	}
});