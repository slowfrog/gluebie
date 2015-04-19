"use strict";

var game = new Phaser.Game(800, 600, Phaser.AUTO, "gameDiv");

// MENU
var menuState = {};
menuState.preload = function() {
  game.stage.backgroundColor = "#303030";
};

// MAIN GAME
var gameState = {};

gameState.preload = function() {
  game.stage.backgroundColor = "#202020";
  game.load.spritesheet("tiles", "tiles.png", 32, 32);
};

gameState.create = function() {
  this.level = Level.parse(Level.LEVEL1);
  this.boy = Boy.create(this.level.getStartX(), this.level.getStartY());
  this.level.addEntity(this.boy);
  this.glueCount = 0;
  this.bagCount = 0;
  this.renderer = new Renderer(this.level, this.boy, game);
  this.renderer.renderBoard();

  this.arrows = game.input.keyboard.createCursorKeys();
};

gameState.update = function() {
  // Check input
  var d = 15;
  if (this.arrows.down.downDuration(d)) {
    this.tryStepGame(0, 1);
  } else if (this.arrows.right.downDuration(d)) {
    this.tryStepGame(1, 0);
  } else if (this.arrows.up.downDuration(d)) {
    this.tryStepGame(0, -1);
  } else if (this.arrows.left.downDuration(d)) {
    this.tryStepGame(-1, 0);
  }

  this.renderer.renderContents();
  this.renderer.renderInventory(this.glueCount, this.bagCount);
};

gameState.tryStepGame = function(dx, dy) {
  var x = this.boy.getX() + dx;
  var y = this.boy.getY() + dy;
  if ((x >= 0) && (x < this.level.getWidth()) &&
      (y >= 0) && (y < this.level.getHeight())) {
    if (this.level.getBoard(x, y) != Level.WALL) {
      this.stepGame(dx, dy);
    }
  }
};

gameState.stepGame = function(dx, dy) {
  this.boy.moveBy(dx, dy);
  var contents = this.level.getContent(this.boy.getX(), this.boy.getY());
  for (var i = contents.length - 1; i >= 0; --i) {
    var obj = contents[i];
    if (obj instanceof Item) {
      if (obj.getType() == Item.GLUE_TUBE) {
        this.glueCount += 1;
        contents.splice(i, 1);
      } else if (obj.getType() == Item.BAG_PILE) {
        this.bagCount += 1;
        contents.splice(i, 1);
      } else if (obj.getType() == Item.GLUE_STAIN) {
        // Boy is stuck!
        contents.splice(i, 1);
      }
    }
  }
};

// Wrap it up
game.state.add("menu", menuState);
game.state.add("game", gameState);
game.state.start("game");
                 
