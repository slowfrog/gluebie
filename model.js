"use strict";

var Item = function() {};

Item.GLUE_TUBE = 1;
Item.BAG_PILE = 2;
Item.GLUE_STAIN = 3;

Item.create = function(type, opt_value) {
  var i = new Item();
  i._init_(type, opt_value);
  return i;
};

Item.prototype._init_ = function(type, opt_value) {
  this.type = type;
  this.value = opt_value || 0;
};

Item.prototype.getType = function() {
  return this.type;
};

Item.prototype.getValue = function() {
  return this.value;
};

// Level contents
var Level = function() {};

Level.CLEAR = 0;
Level.WALL = 1;
Level.START = 2;
Level.EXIT = 3;

Level.create = function(width, height) {
  var l = new Level();
  l._init_(width, height);
  return l;
};

Level.prototype._init_ = function(width, height) {
  this.width = width;
  this.height = height;
  this.board = [];
  this.content = [];
  for (var j = 0; j < height; ++j) {
    var line = [];
    var contentLine = [];
    for (var i = 0; i < width; ++i) {
      line.push(Level.CLEAR);
      contentLine.push([]);
    }
    this.board.push(line);
    this.content.push(contentLine);
  }
};

Level.prototype.getWidth = function() {
  return this.width;
};

Level.prototype.getHeight = function() {
  return this.height;
};

Level.prototype.getBoard = function(x, y) {
  return this.board[y][x];
};

Level.prototype.setBoard = function(x, y, v) {
  this.board[y][x] = v;
};

Level.prototype.getContent = function(x, y) {
  return this.content[y][x];
};
