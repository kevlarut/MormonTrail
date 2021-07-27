var characterScreen = new function() {
	var callback = null;
	var canvas = null;
	var context = null;
	var sprites = null;
	var self = this;
	var party = [];
	var touchZones = [];
	var names = [];

	this.start = function(canvas, context, sprites, callback) {
		this.callback = callback;
		this.canvas = canvas;
		this.context = context;
		this.sprites = sprites;

		this.touchZones = [];
		for (var index = 0, row = 0; row < 4; row++, index++) {
			for (var col = 0; col < 2; col++) {				
				var x = 20 + col * 100;
				var y = 60 + row * 25;
				this.touchZones.push({
					left: x - 2,
					top: y - 2,
					right: x + 22,
					bottom: y + 22,
					nameIndex: index,
				});
			}
		}	

		game.touchHandler = this.handleTouchInput;

		this.chooseCharacterNames();
	}

	this.drawCharacterMenu = function(cursor, names) {
		this.context.clearRect(0, 58, this.canvas.width, 100);
		var index = 0;
		for (var row = 0; row < 4; row++) {
			for (var col = 0; col < 2; col++) {				
				var x = 20 + col * 100;
				var y = 60 + row * 25;
				if (index === cursor) {				
					this.context.beginPath();
					this.context.rect(x - 2, y - 2, 24, 24);
					this.context.fillStyle = 'white';
					this.context.fill();
				}
			
				var name = this.names[index];
				this.sprites[name.name.toLowerCase()].render(this.context, x, y);
				if (name.selected) {
					this.context.fillStyle = 'white';
				}
				else {
					this.context.fillStyle = 'gray';
				}
				this.context.fillText(name.name, x + 25, y + 12);
				index++;
			}
		}	
	}

	this.chooseCharacterNames = function() {	
		audioPlayer.stopAllAudio();
	
		this.partySize = 4;
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		
		this.context.beginPath();
		this.context.rect(20, 10, 240, 25);
		this.context.fillStyle = 'white';
		this.context.fill();
			
		this.context.textAlign = 'center';
		this.context.font = "8px 'Here Lies MECC'";
		this.context.fillStyle = 'black';
		
		var horizontalCenter = this.canvas.width / 2;
		this.context.fillText("Zion or Bust", horizontalCenter, 20);
		this.context.fillText("by Kevin Owens", horizontalCenter, 30);
		
		this.context.textAlign = 'left';
		this.context.fillStyle = 'white';
		this.context.fillText("Choose four family members:", 20, 50);
		this.context.fillText("Press SPACE to choose someone", 20, 172);
		
		this.names = [
			{ name: 'Joseph', isAdult: true, selected: false },
			{ name: 'Emma', isAdult: true, selected: false }, 
			{ name: 'Brigham', isAdult: true, selected: false }, 
			{ name: 'Lucy', isAdult: true, selected: false }, 
			{ name: 'John', isAdult: false, selected: false }, 
			{ name: 'Mary', isAdult: false, selected: false }, 
			{ name: 'Alma', isAdult: false, selected: false }, 
			{ name: 'Eliza', isAdult: false, selected: false }
		];
		var cursor = 0;
		this.selectedCount = 0;
		this.drawCharacterMenu(cursor, this.names);
		
		window.document.onkeydown = function(event) {
			switch (event.keyCode) {
				case keyboard.ENTER:
					if (self.selectedCount == self.partySize) {
						window.document.onkeydown = null;
						for (var i = 0; i < self.names.length; i++) {
							var name = self.names[i];
							if (name.selected) {
								party.push(name);
							}
						}
						self.end();
					}
					break;
				case keyboard.SPACE:
					self.toggleSelected(cursor);
					break;
				case keyboard.LEFT:
					if (cursor % 2 == 1) {
						cursor--;
						self.drawCharacterMenu(cursor, self.names);
					}
					break;
				case keyboard.UP:
					if (cursor > 1) {
						cursor -= 2;
						self.drawCharacterMenu(cursor, self.names);
					}
					break;
				case keyboard.RIGHT:
					if (cursor % 2 == 0) {
						cursor++;
						self.drawCharacterMenu(cursor, self.names);
					}
					break;
				case keyboard.DOWN:
					if (cursor < self.names.length - 2) {
						cursor += 2;
						self.drawCharacterMenu(cursor, names);
					}
					break;
			}
		}
	}	
	
	this.handleTouchInput = function(globalX, globalY) {
		var x = globalX / 2;
		var y = globalY / 2;
		console.log("Kevin, character screen received a touch at ", x, y);
		for (var i = 0; i < self.touchZones.length; i++) {
			var zone = self.touchZones[i];
			if (x >= zone.left && x <= zone.right && y >= zone.top && y <= zone.bottom) {
				self.toggleSelected(zone.nameIndex);
				return;
			}
		}
	}

	this.toggleSelected = (nameIndex) => {
		if (self.names[nameIndex].selected) {
			self.names[nameIndex].selected = false;
			self.selectedCount--;
			self.context.clearRect(17, 175, 240, 13);
		}
		else if (self.selectedCount < self.partySize) {
			self.names[nameIndex].selected = true;
			self.selectedCount++;
			if (self.selectedCount == self.partySize) {
				self.context.beginPath();
				self.context.rect(17, 175, 240, 13);
				self.context.fillStyle = 'white';
				self.context.fill();

				self.context.fillStyle = 'black';
				self.context.fillText("Press ENTER to continue", 20, 185);
			}
		}
		self.drawCharacterMenu(nameIndex, self.names);
	}

	this.end = function() {
		self.callback(party);
	}
}