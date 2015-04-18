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
  var l = Level.create(10, 10);
  for (var i = 0; i < 10; ++i) {
    l.setBoard(i, 0, Level.WALL);
    l.setBoard(0, i, Level.WALL);
    l.setBoard(i, 9, Level.WALL);
    l.setBoard(9, i, Level.WALL);
  }
  l.setBoard(0, 4, Level.START);
  l.setBoard(9, 5, Level.EXIT);

  l.getContent(3, 3).push(Item.create(Item.GLUE_TUBE, 5));
  l.getContent(4, 4).push(Item.create(Item.BAG_PILE, 2));
  l.getContent(5, 5).push(Item.create(Item.GLUE_STAIN));
  
  // Render board
  this.board = game.add.group(undefined, "board", true);
  for (var i = 0; i < l.getWidth(); ++i) {
    for (var j = 0; j < l.getHeight(); ++j) {
      game.add.sprite(10 + 32 * i, 10 + 32 * j, "tiles", l.getBoard(i, j), this.board);
    }
  }

  // Render contents
  this.objects = game.add.group(undefined, "objects", true);
  for (var i = 0; i < l.getWidth(); ++i) {
    for (var j = 0; j < l.getHeight(); ++j) {
      var content = l.getContent(i, j);
      for (var k = 0; k < content.length; ++k) {
        var obj = content[k];
        if (obj instanceof Item) {
          console.log("XXX ", obj);
          game.add.sprite(10 + 32 * i, 10 + 32 * j, "tiles", obj.getType() + 3, this.objects);
        }
      }
    }
  }
};

gameState.update = function() {
};

// Wrap it up
game.state.add("menu", menuState);
game.state.add("game", gameState);
game.state.start("game");
                 
