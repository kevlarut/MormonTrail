var buySuppliesScreen = new function() {
    var canvas = null;
    var context = null;
    var party = null;
    var nonFoodInventory = [];
    var callback = null;
	var self = this;
    var food = 0;

    this.start = function(canvas, context, party, callback) {
        this.canvas = canvas;
        this.context = context;
        this.party = party;
        this.callback = callback;

		var capacity = HANDCART_CAPACITY;
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
		var items = [
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
		
		nonFoodInventory.push(clothingAndSuchlike);
		
		var cursor = 0;	
		self.drawBuySuppliesMenu(cursor, items, capacity);
				
		this.context.beginPath();
		this.context.rect(17, 175, 240, 13);
		this.context.fillStyle = 'white';
		this.context.fill();

		this.context.fillStyle = 'black';
		this.context.fillText("Press ENTER to continue", 20, 185);

		window.document.onkeydown = function(event) {
			switch (event.keyCode) {
				case keyboard.ENTER:
					window.document.onkeydown = null;
					self.end();
					break;
				case keyboard.X:
				case keyboard.SPACE:
					if (items[cursor].isSelected) {
						for (var i = 0; i < nonFoodInventory.length; i++) {
							if (nonFoodInventory[i].name === items[cursor].name) {
								nonFoodInventory.splice(i, 1);
								break;
							}
						}
					}
					else {
						nonFoodInventory.push(items[cursor]);						
					}
					items[cursor].isSelected = !items[cursor].isSelected;
					self.drawBuySuppliesMenu(cursor, items, capacity);
					break;
				case keyboard.UP:
					if (cursor > 0) {
						cursor--;
						self.drawBuySuppliesMenu(cursor, items, capacity);
					}
					break;
				case keyboard.DOWN:
					if (cursor < items.length - 2) {
						cursor++;
						self.drawBuySuppliesMenu(cursor, items, capacity);
					}
					break;
			}
		}
	}
    
	self.drawBuySuppliesMenu = function(cursor, items, capacity) {	
		this.context.clearRect(0, 15, this.canvas.width, 100);
		
		this.food = capacity;
	
		var line = 0;
		for (line = 0; line < items.length; line++) {
			var item = items[line];
			
			if (item.isSelected) {
				this.food -= item.weight;
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
		this.context.fillText('You will carry ' + this.food + ' pounds of food.', 10, 40 + line * 15);
	}
    this.end = function() {
        this.callback(this.nonFoodInventory, this.food);
    }
}