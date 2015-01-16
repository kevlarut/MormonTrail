var gameApp = angular.module('gameApp');

gameApp.controller('gameController', ['$scope', '$timeout', function($scope, $timeout) {
 
	$scope.lastUpdated = new Date();

	$scope.animationIndex = 0;
	$scope.context = null;
	$scope.canvasWidth = 0;	
		
	$scope.screen = 'TRAVEL';
	
	$scope.wagonImage1 = null;
	$scope.wagonImage2 = null;
	$scope.emigrationCanyonImage = null;
		
	$scope.clearCanvas = function() {
		$scope.context
			.clear()
			.bgIndex(0);
	}
	
    $scope.drawTextAtLine = function (text, line) {
		var ctx = $scope.context;
		ctx	
			.fillIndex(0)
			.font('c64')
			.textAlign('center')
			.penColor(255,255,255)
			.text(text, $scope.canvasWidth, 8*line);
    };
		
	$scope.drawWagon = function() {	
		if ($scope.animationIndex === 0) {
			$scope.context.drawImage($scope.wagonImage1, 170, 40);
		}
		else {
			$scope.context.drawImage($scope.wagonImage2, 170, 40);
		}
	}
	
	$scope.loadImages = function(onload) {
		$scope.wagonImage1 = new Image;
		$scope.wagonImage1.crossOrigin = '';
		//$scope.wagonImage1.onload = onload;
		$scope.wagonImage1.src = 'img/wagon1.gif';
		
		$scope.wagonImage2 = new Image;
		$scope.wagonImage2.crossOrigin = '';
		//$scope.wagonImage2.onload = onload;
		$scope.wagonImage2.src = 'img/wagon2.gif';
		
		$scope.emigrationCanyonImage = new Image;
		$scope.emigrationCanyonImage.crossOrigin = '';
		$scope.emigrationCanyonImage.onload = onload;
		$scope.emigrationCanyonImage.src = 'img/emigration-canyon.gif';
	}
	
	$scope.init = function() {	
		var canvas = document.getElementById('game');
		var ctx = canvas.getContext('retro');
		
		$scope.context = ctx;
		
		var res = ctx.resolution(),
		w = res.width,
		h = res.height,
		canvasWidth = (w * 0.5)|0;
		$scope.canvasWidth = canvasWidth;
		
		$scope.loadImages(function() {
			ctx
				.palette('APPLEII')
				.addFonts([fontC64, fontRetroBig], $scope.update, function() { console.log('A font is missing...'); });
		});
	}
	
	$scope.renderWalkingScreen = function() {
		$scope.drawTextAtLine('The Mormon Trail', 1);
		$scope.drawWagon();		
	}
	
	$scope.renderScenery = function() {
	
		var image = $scope.emigrationCanyonImage;
		$scope.context
			.drawImage(image, 0, 0, 280, 160, 'palette-fs');
		$scope.drawTextAtLine('This is the place!', 21);
	}
	
	$scope.render = function() {
		$scope.clearCanvas();
		
		switch ($scope.screen) {
			case 'TRAVEL':			
				$scope.renderWalkingScreen();
				break;
			default:
				$scope.renderScenery();
				break;
		}
	}
	
	$scope.update = function() {
		var framesPerSecond = 2;
		
		var now = new Date();
		var timeSinceLastUpdate = now.getTime() - $scope.lastUpdated.getTime();
					
		$scope.render();
		
		if ($scope.animationIndex == 0) {
			$scope.animationIndex = 1;
		}
		else {
			$scope.animationIndex = 0;
		}
		
		if (Math.random() > 0.99) {
			$scope.screen = 'VICTORY';
		}
		
		$scope.lastUpdated = now;		
		$timeout($scope.update, 1000 / framesPerSecond);
	}
	
	$scope.init();	
	
}]);