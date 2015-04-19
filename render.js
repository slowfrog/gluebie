"use strict";

// Rendering stuff
var CLEAR_BOARD_SPRITE = 0;
var WALL_SPRITE = 1;
var START_SPRITE = 2;
var EXIT_SPRITE = 3;
var GLUE_TUBE_SPRITE = 4;
var BAG_PILE_SPRITE = 5;
var GLUE_STAIN_SPRITE = 6;

var BOY_SPRITE = 20;

var ROBOT_SPRITE = 30;

var BOARD_SPRITE = [];
BOARD_SPRITE[Level.CLEAR] = CLEAR_BOARD_SPRITE;
BOARD_SPRITE[Level.WALL] = WALL_SPRITE;
BOARD_SPRITE[Level.START] = START_SPRITE;
BOARD_SPRITE[Level.EXIT] = EXIT_SPRITE;

var ITEM_SPRITE = [];
ITEM_SPRITE[Item.GLUE_TUBE] = GLUE_TUBE_SPRITE;
ITEM_SPRITE[Item.BAG_PILE] = BAG_PILE_SPRITE;
ITEM_SPRITE[Item.GLUE_STAIN] = GLUE_STAIN_SPRITE;


// Renderer
var Renderer = function(level, boy, game) {
  this.level = level;
  this.boy = boy;
  this.game = game;

  this.boardOffsetX = 0;
  this.boardOffsetY = 600 - 32 * this.level.getHeight();
  this.invOffsetX = 0;
  this.invOffsetY = 0;
};

Renderer.prototype.renderBoard = function() {
  if (this.board) {
    this.board.destroy();
  }
  this.board = this.game.add.group(undefined, "board", true);
  for (var i = 0; i < this.level.getWidth(); ++i) {
    for (var j = 0; j < this.level.getHeight(); ++j) {
      this.game.add.sprite(this.boardOffsetX + 32 * i, this.boardOffsetY + 32 * j, "tiles",
                           BOARD_SPRITE[this.level.getBoard(i, j)], this.board);
    }
  }
};

Renderer.prototype.renderContents = function() {
  // Render contents
  if (this.objects) {
    this.objects.destroy();
  }
  this.objects = this.game.add.group(undefined, "objects", true);
  for (var i = 0; i < this.level.getWidth(); ++i) {
    for (var j = 0; j < this.level.getHeight(); ++j) {
      var content = this.level.getContent(i, j);
      for (var k = 0; k < content.length; ++k) {
        var obj = content[k];
        if (obj instanceof Item) {
          this.game.add.sprite(this.boardOffsetX + 32 * i, this.boardOffsetY + 32 * j, "tiles",
                               ITEM_SPRITE[obj.getType()], this.objects);
        } else if (obj instanceof Boy) {
          this.game.add.sprite(this.boardOffsetX + 32 * i, this.boardOffsetY + 32 * j, "tiles",
                               BOY_SPRITE, this.objects);
        } else if (obj instanceof Robot) {
          this.game.add.sprite(this.boardOffsetX + 32 * i, this.boardOffsetY + 32 * j, "tiles",
                               ROBOT_SPRITE, this.objects);
        }
      }
    }
  }
};

Renderer.prototype.renderInventory = function(glueCount, bagCount) {
  if (this.inventory) {
    this.inventory.destroy();
  }
  this.inventory = this.game.add.group(undefined, "inventory", true);
  for (var i = 0; i < glueCount; ++i) {
    this.game.add.sprite(this.invOffsetX + 32 * i, this.invOffsetY, "tiles",
                         ITEM_SPRITE[Item.GLUE_TUBE], this.inventory);
  }
  for (var i = 0; i < bagCount; ++i) {
    this.game.add.sprite(this.invOffsetX + 32 * (i + glueCount), this.invOffsetY, "tiles",
                         ITEM_SPRITE[Item.BAG_PILE], this.inventory);
  }
};
