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

var MOVE_UP_SPRITE = 40;
var MOVE_DOWN_SPRITE = 41;
var MOVE_RIGHT_SPRITE = 42;
var MOVE_LEFT_SPRITE = 43;
var GLUE_UP_SPRITE = 44;
var GLUE_DOWN_SPRITE = 45;
var GLUE_RIGHT_SPRITE = 46;
var GLUE_LEFT_SPRITE = 47;
var BAG_UP_SPRITE = 48;
var BAG_DOWN_SPRITE = 49;
var BAG_RIGHT_SPRITE = 50;
var BAG_LEFT_SPRITE = 51;

var ARROW_UP_SPRITE = [];
ARROW_UP_SPRITE[Mode.MOVE] = MOVE_UP_SPRITE;
ARROW_UP_SPRITE[Mode.GLUE] = GLUE_UP_SPRITE;
ARROW_UP_SPRITE[Mode.BAG] = BAG_UP_SPRITE;

var ARROW_DOWN_SPRITE = [];
ARROW_DOWN_SPRITE[Mode.MOVE] = MOVE_DOWN_SPRITE;
ARROW_DOWN_SPRITE[Mode.GLUE] = GLUE_DOWN_SPRITE;
ARROW_DOWN_SPRITE[Mode.BAG] = BAG_DOWN_SPRITE;

var ARROW_RIGHT_SPRITE = [];
ARROW_RIGHT_SPRITE[Mode.MOVE] = MOVE_RIGHT_SPRITE;
ARROW_RIGHT_SPRITE[Mode.GLUE] = GLUE_RIGHT_SPRITE;
ARROW_RIGHT_SPRITE[Mode.BAG] = BAG_RIGHT_SPRITE;

var ARROW_LEFT_SPRITE = [];
ARROW_LEFT_SPRITE[Mode.MOVE] = MOVE_LEFT_SPRITE;
ARROW_LEFT_SPRITE[Mode.GLUE] = GLUE_LEFT_SPRITE;
ARROW_LEFT_SPRITE[Mode.BAG] = BAG_LEFT_SPRITE;

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

Renderer.prototype.renderArrows = function(level, x, y, mode) {
  if (this.arrows) {
    this.arrows.destroy();
  }
  var okWithMode = function(mode, i, j) {
    return (mode != Mode.BAG || !!level.getRobot(i, j));
  };
  this.arrows = this.game.add.group(undefined, "arrows", true);
  if (y > 0 && level.getBoard(x, y - 1) != Level.WALL &&
      okWithMode(mode, x, y - 1)) {
    this.game.add.sprite(this.boardOffsetX + 32 * x, this.boardOffsetY + 32 * (y - 1), "tiles",
                         ARROW_UP_SPRITE[mode], this.arrows);
  }
  if (y < level.getHeight() - 1 && level.getBoard(x, y + 1) != Level.WALL &&
      okWithMode(mode, x, y + 1)) {
    this.game.add.sprite(this.boardOffsetX + 32 * x, this.boardOffsetY + 32 * (y + 1), "tiles",
                         ARROW_DOWN_SPRITE[mode], this.arrows);
  }
  if (x > 0 && level.getBoard(x - 1, y) != Level.WALL &&
      okWithMode(mode, x - 1, y)) {
    this.game.add.sprite(this.boardOffsetX + 32 * (x - 1), this.boardOffsetY + 32 * y, "tiles",
                         ARROW_LEFT_SPRITE[mode], this.arrows);
  }
  if (x < level.getWidth() - 1 && level.getBoard(x + 1, y) != Level.WALL &&
      okWithMode(mode, x + 1, y)) {
    this.game.add.sprite(this.boardOffsetX + 32 * (x + 1), this.boardOffsetY + 32 * y, "tiles",
                         ARROW_RIGHT_SPRITE[mode], this.arrows);
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
