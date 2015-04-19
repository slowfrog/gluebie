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
  game.stage.backgroundColor = "#ff0000";
  game.load.spritesheet("tiles", "tiles.png", 32, 32);
};

gameState.create = function() {
  this.level = Level.parse(Level.LEVEL1);
  this.boy = Boy.create(this.level.getStartX(), this.level.getStartY());
  this.level.addEntity(this.boy);
  
  // Render board
  this.board = game.add.group(undefined, "board", true);
  for (var i = 0; i < this.level.getWidth(); ++i) {
    for (var j = 0; j < this.level.getHeight(); ++j) {
      game.add.sprite(10 + 32 * i, 10 + 32 * j, "tiles",
                      BOARD_SPRITE[this.level.getBoard(i, j)], this.board);
    }
  }

  this.arrows = game.input.keyboard.createCursorKeys();
  console.log("HERE", this.arrows);

  // Time
  this.timer = new Phaser.Timer();
  this.last = this.timer.ms;
};

gameState.update = function() {
  // Check input
  var d = 15;
  this.last = this.timer.ms;
  if (this.arrows.down.downDuration(d)) {
    this.stepGame(0, 1);
  } else if (this.arrows.right.downDuration(d)) {
    this.stepGame(1, 0);
  } else if (this.arrows.up.downDuration(d)) {
    this.stepGame(0, -1);
  } else if (this.arrows.left.downDuration(d)) {
    this.stepGame(-1, 0);
  }
  
  // Render contents
  if (this.objects) {
    this.objects.destroy();
  }
  this.objects = game.add.group(undefined, "objects", true);
  for (var i = 0; i < this.level.getWidth(); ++i) {
    for (var j = 0; j < this.level.getHeight(); ++j) {
      var content = this.level.getContent(i, j);
      for (var k = 0; k < content.length; ++k) {
        var obj = content[k];
        if (obj instanceof Item) {
          game.add.sprite(10 + 32 * i, 10 + 32 * j, "tiles",
                          ITEM_SPRITE[obj.getType()], this.objects);
        } else if (obj instanceof Boy) {
          game.add.sprite(10 + 32 * i, 10 + 32 * j, "tiles",
                          BOY_SPRITE, this.objects);
        }
      }
    }
  }
  
};

gameState.stepGame = function(dx, dy) {
  var x = this.boy.getX() + dx;
  var y = this.boy.getY() + dy;
  if ((x >= 0) && (x < this.level.getWidth()) &&
      (y >= 0) && (y < this.level.getHeight())) {
    if (this.level.getBoard(x, y) != Level.WALL) {
      this.boy.moveBy(dx, dy);
    }
  }
};

// Wrap it up
game.state.add("menu", menuState);
game.state.add("game", gameState);
game.state.start("game");
                 
