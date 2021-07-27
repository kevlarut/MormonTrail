var buySuppliesScreen = new function() {
    var canvas = null;
    var context = null;
    var party = null;
    this.nonFoodInventory = [];
    var callback = null;
	var self = this;
    this.food = 0;
	var cursor = 0;	

    this.start = function(canvas, context, party, callback) {
        this.canvas = canvas;
        this.context = context;
        this.party = party;
        this.callback = callback;
		this.touchZones = [];
		this.food = 0;

		this.capacity = HANDCART_CAPACITY;
		var clothingWeight = 0;
		for (var i = 0; i < this.party.length; i++) {
			if (this.party[i].isAdult) {
				clothingWeight += 17;
			}
			else {
				clothingWeight += 10;
			}
		}
	
		audioPlayer.stopAllAudio();
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		
		this.context.textAlign = 'center';
		this.context.font = "8px 'Here Lies MECC'";
		this.context.fillStyle = 'black';
		
		this.context.beginPath();
		this.context.rect(0, 0, this.canvas.width, 13);
		this.context.fillStyle = '#93D6BF';
		this.context.fill();
			
		this.context.textAlign = 'left';
		this.context.fillStyle = 'black';
		this.context.fillText("Pioneer Outfitter General Store", 10, 10);
		this.context.fillStyle = 'white';
		
		var clothingAndSuchlike = {
			name: 'Clothing and suchlike',
			weight: clothingWeight,
			isSelected: true,
			isRequired: true
		};
		this.items = [
			{
				name: 'Flintlock musket',
				weight: 10,
				isSelected: false,
				isRequired: false
			},
			{
				name: 'Spiffy home decorations',
				weight: 60,
				isSelected: false,
				isRequired: false
			},
			clothingAndSuchlike
		];
		
		this.nonFoodInventory.push(clothingAndSuchlike);
		
		self.drawBuySuppliesMenu(self.cursor);
				
		this.context.beginPath();
		this.context.rect(17, 175, 240, 13);
		this.context.fillStyle = 'white';
		this.context.fill();

		this.context.fillStyle = 'black';
		this.context.fillText("Press ENTER to continue", 20, 185);

		window.document.onkeydown = function(event) {
			switch (event.keyCode) {
				case keyboard.ENTER:
					self.end();
					break;
				case keyboard.X:
				case keyboard.SPACE:
					self.toggleItem(self.cursor);
					break;
				case keyboard.UP:
					if (self.cursor > 0) {
						self.cursor--;
						self.drawBuySuppliesMenu(self.cursor);
					}
					break;
				case keyboard.DOWN:
					if (self.cursor < self.items.length - 2) {
						self.cursor++;
						self.drawBuySuppliesMenu(self.cursor);
					}
					break;
			}
		}
		
		var line = 0;
		for (line = 0; line < self.items.length - 1; line++) {
			var y = 25 + 15 * line;
			
			self.touchZones.push({
				left: 0,
				right: this.canvas.width,
				top: y - 10,
				bottom: y + 2,
				itemIndex: line,
			});
		}		

		self.touchZones.push({
			left: 17,
			top: 176,
			right: 257,
			bottom: 189,
			action: "continue",
		});
		game.touchHandler = this.handleTouchInput;
	}
    
	this.toggleItem = (cursor) => {
		if (!self.items[cursor].isRequired) {
			if (self.items[cursor].isSelected) {
				for (var i = 0; i < self.nonFoodInventory.length; i++) {
					if (self.nonFoodInventory[i].name === self.items[cursor].name) {
						self.nonFoodInventory.splice(i, 1);
						break;
					}
				}
			}
			else {
				self.nonFoodInventory.push(self.items[cursor]);						
			}
			self.items[cursor].isSelected = !self.items[cursor].isSelected;
		}
		self.drawBuySuppliesMenu(cursor);
	}

	this.drawBuySuppliesMenu = function(cursor) {	
		this.context.clearRect(0, 15, this.canvas.width, 100);
		
		self.food = self.capacity;
	
		var line = 0;
		for (line = 0; line < self.items.length; line++) {
			var item = self.items[line];
			
			if (item.isSelected) {
				self.food -= item.weight;
			}
			
			var y = 25 + 15 * line;
			
			if (line === cursor) {		
				this.context.beginPath();
				this.context.rect(0, y - 10, this.canvas.width, 12);
				this.context.fillStyle = 'white';
				this.context.fill();
				this.context.fillStyle = 'black';
			}
			else {			
				this.context.fillStyle = 'white';
			}
			
			this.context.textAlign = 'left';
			this.context.fillText('[' + (item.isSelected ? 'X' : ' ') + '] ' + item.name, 10, y);				
			this.context.textAlign = 'right';
			this.context.fillText(item.weight + '#', 275, y);
		}
		
		this.context.textAlign = 'left';
		this.context.fillText('You will carry ' + self.food + ' pounds of food.', 10, 40 + line * 15);
	}
	
	this.handleTouchInput = function(x, y) {
		for (var i = 0; i < self.touchZones.length; i++) {
			var zone = self.touchZones[i];
			if (x >= zone.left && x <= zone.right && y >= zone.top && y <= zone.bottom) {
				if (zone.itemIndex !== undefined) {
					self.cursor = zone.itemIndex;
					self.toggleItem(self.cursor);
				}
				if (zone.action === "continue") {
					self.end();
				}
			}
		}
	}

    this.end = function() {
		window.document.onkeydown = null;
		game.touchHandler = null;
        self.callback(self.nonFoodInventory, self.food);
    }
}