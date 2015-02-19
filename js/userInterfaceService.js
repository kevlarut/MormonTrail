var gameApp = angular.module('gameApp');

gameApp.service('userInterfaceService', function(imageData, userInterfaceData) {

	this.haltForInput = function(callback) {		
		userInterfaceData.inputCallback = callback;
		userInterfaceData.animating = false;
	}
		
	this.drawTextAtLine = function (text, line) {	
		this.drawText(text, { line: line });
    };
	
	this.drawText = function(text, options) {
		var backgroundColorIndex = options.background || userInterfaceData.BLACK_INDEX;
		var font = 'c64';
		var textAlign = options.textAlign || 'center';
		var foregroundColorIndex = (options.foreground || userInterfaceData.WHITE_INDEX);
		var characterHeight = 8;
		var line = options.line || 0;
		var y = characterHeight * line;
		
		userInterfaceData.context
			.fillIndex(backgroundColorIndex)
			.font(font)
			.textAlign(textAlign)
			.penIndex(foregroundColorIndex)
			.text(text, userInterfaceData.canvasWidth, y);
			
	}
		
	this.renderDefeatScreen = function() {	
		var image = imageData.failureScreen;
		userInterfaceData.context.drawImage(image, 0, 0, 280, 160, 'palette-fs');
			
		userInterfaceData.modal = 'And should we die before our journey\'s through,\nHappy day! All is well!\nWe then are free from toil and sorrow, too;\nWith the just we shall dwell!';
		
		this.drawTextAtLine('Game Over', 21);		
	}
	
	this.renderModal = function() {
		if (userInterfaceData.modal != null) {		
			var text = userInterfaceData.modal;
			var lines = wordWrap(text);
			
			startingLine = parseInt(12 - lines.length / 2);
			
			userInterfaceData.context.penColor(255,255,255);
			userInterfaceData.context.fillColor(0,0,0);
			userInterfaceData.context.rect(35, 8 * startingLine - 5, 210, startingLine + (8 * lines.length));
		
			for (var i = 0; i < lines.length; i++) {
				this.drawTextAtLine(lines[i], startingLine + i);					
			}
		}
	}
	
	var wordWrap = function(text) {
		
		var width = 25;
		
		if (!text) { 
			return text; 
		}
	 
		var regex = '.{1,' + width + '}(\\s|$)|\\S+?(\\s|$)';
	 
		var lines = text.match( RegExp(regex, 'g') );
		
		return lines;
		
	}
	
});