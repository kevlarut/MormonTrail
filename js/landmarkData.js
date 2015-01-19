var gameApp = angular.module('gameApp');

gameApp.service('landmarkData', function() {
		
	this.landmarks = [
		{
			name: 'Sugar Creek',
			miles: 7,
			src: 'img/sugar-creek.gif'
		},		
		{
			name: 'Winter Quarters',
			miles: 266,
			src: 'img/winter-quarters.gif'
		},		
		{
			name: 'Chimney Rock',
			miles: 718,
			src: 'img/chimney-rock.gif'
		},		
		{
			name: 'Fort Laramie',
			miles: 788,
			src: 'img/fort-laramie.gif'
		},		
		{
			name: 'Martin\'s Cove',
			miles: 993,
			src: 'img/martins-cove.gif'
		},		
		{
			name: 'Echo Canyon',
			miles: 1246,
			src: 'img/echo-canyon.gif'
		},		
		{
			name: 'Emigration Canyon',
			miles: 1283,
			src: 'img/emigration-canyon.gif'
		},		
		{
			name: 'Salt Lake Valley',
			miles: 1297,
			src: 'img/salt-lake-valley.gif'
		}
	];
	
});