"use strict";

// Event
var Event = function() {};

Event.create = function(type) {
  return new Event()._init_(type);
};

Event.prototype._init_ = function(type) {
  this.type = type;
  return this;
};

Event.prototype.getType = function() {
  return this.type;
};

Event.prototype.setSource = function(s) {
  this.source = s;
};

Event.prototype.getSource = function() {
  return this.source;
};

// Observable
var Observable = function() {};

Observable.create = function() {
  var o = new Observable();
  o._init_();
  return o;
};

Observable.prototype._init_ = function() {
  this.observers = [];
};

Observable.prototype.addObserver = function(o) {
  for (var i = 0; i < this.observers.length; ++i) {
    if (this.observers[i] == o) {
      return;
    }
  }
  this.observers.push(o);
};

Observable.prototype.removeObserver = function(o) {
  for (var i = 0; i < this.observers.length; ++i) {
    if (this.observers[i] == o) {
      this.observers = this.observers.splice(i, 1);
      return;
    }
  }
};

Observable.prototype.notify = function(e) {
  e.setSource(this);
  for (var i = 0; i < this.observers.length; ++i) {
    this.observers[i].notify(e);
  }
};


// Entity
var Entity = function() {};
Entity.prototype = new Observable();

Entity.MOVED = new Object();
  
Entity.create = function(x, y) {
  return new Entity()._init_(x, y);
};

Entity.prototype._init_ = function(x, y) {
  Observable.prototype._init_.call(this);
  this.x = x;
  this.y = y;
  return this;
};

Entity.prototype.getX = function() {
  return this.x;
};

Entity.prototype.getY = function() {
  return this.y;
};

Entity.prototype.moveBy = function(dx, dy) {
  this.moveTo(this.x + dx, this.y + dy);
};

Entity.prototype.moveTo = function(x, y) {
  if (x != this.x || y != this.y) {
    var prevX = this.x;
    var prevY = this.y;
    this.x = x;
    this.y = y;
    // norify move
    this.notify(MoveEvent.create(prevX, prevY, this.x, this.y));
  }
};

// MoveEvent
var MoveEvent = function() {};
MoveEvent.prototype = new Event();

MoveEvent.create = function(x0, y0, x1, y1) {
  return new MoveEvent()._init_(x0, y0, x1, y1);
};

MoveEvent.prototype._init_ = function(x0, y0, x1, y1) {
  Event.prototype._init_.call(this, Entity.MOVED);
  this.x0 = x0;
  this.y0 = y0;
  this.x1 = x1;
  this.y1 = y1;
  return this;
};

MoveEvent.prototype.getX0 = function() {
  return this.x0;
};

MoveEvent.prototype.getY0 = function() {
  return this.y0;
};

MoveEvent.prototype.getX1 = function() {
  return this.x1;
};

MoveEvent.prototype.getY1 = function() {
  return this.y1;
};

// Items
var Item = function() {};
Item.prototype = new Entity();

Item.GLUE_TUBE = 1;
Item.BAG_PILE = 2;
Item.GLUE_STAIN = 3;

Item.create = function(x, y, type, opt_value) {
  return new Item()._init_(x, y, type, opt_value);
};

Item.prototype._init_ = function(x, y, type, opt_value) {
  Entity.prototype._init_.call(this, x, y);
  this.type = type;
  this.value = opt_value || 0;
  return this;
};

Item.prototype.getType = function() {
  return this.type;
};

Item.prototype.getValue = function() {
  return this.value;
};

// Boy
var Boy = function() {};
Boy.prototype = new Entity();

Boy.create = function(x, y) {
  return new Boy()._init_(x, y);
};

Boy.prototype._init_ = function(x, y) {
  return Entity.prototype._init_.call(this, x, y);
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

Level.prototype.addEntity = function(e) {
  this.getContent(e.getX(), e.getY()).push(e);
  e.addObserver(this);
};

Level.prototype.setStartPos = function(x, y) {
  this.startX = x;
  this.startY = y;
};

Level.prototype.getStartX = function() {
  return this.startX;
};

Level.prototype.getStartY = function() {
  return this.startY;
};

Level.prototype.setExitPos = function(x, y) {
  this.exitX = x;
  this.exitY = y;
};

Level.prototype.getExitX = function() {
  return this.exitX;
};

Level.prototype.getExitY = function() {
  return this.exitY;
};

Level.prototype.notify = function(e) {
  if (e.getType() === Entity.MOVED) {
    var prevContent = this.getContent(e.getX0(), e.getY0());
    for (var i = 0; i < prevContent.length; ++i) {
      if (prevContent[i] === e.getSource()) {
        prevContent.splice(i, 1);
        this.getContent(e.getX1(), e.getY1()).push(e.getSource());
        return;
      }
    }
    console.log("Entity move not processed", e);
  }
};

Level.parse = function(text) {
  var height = text.length;
  var width = text[0].length;
  var l = Level.create(width, height);
  for (var y = 0; y < height; ++y) {
    var line = text[y];
    for (var x = 0; x < width; ++x) {
      switch (line[x]) {
      case "#":
        l.setBoard(x, y, Level.WALL);
        break;
      case ">":
        l.setBoard(x, y, Level.START);
        l.setStartPos(x, y);
        break;
      case "X":
        l.setBoard(x, y, Level.EXIT);
        l.setExitPos(x, y);
        break;
      case "G":
        l.addEntity(Item.create(x, y, Item.GLUE_TUBE, 1));
        break;
      case "B":
        l.addEntity(Item.create(x, y, Item.BAG_PILE, 1));
        break;
      default:
        l.setBoard(x, y, Level.CLEAR);
      }
    }
  }
  return l;
};


// LEVELS
Level.LEVEL1 = [
  "################",
  "#..#.....#...#.#",
  "#.....#........#",
  "#...G....#.....#",
  "#...G..........#",
  "#...G..........#",
  "#..............#",
  ">..............#",
  "#..............#",
  "#....B.........#",
  "#..............#",
  "#.........B....#",
  "#..............#",
  "#..............X",
  "################"];
