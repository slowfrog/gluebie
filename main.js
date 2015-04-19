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
  this.mode = Mode.MOVE;
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
  if (game.input.keyboard.downDuration("G".charCodeAt(0), d) &&
     this.glueCount > 0) {
    this.mode = Mode.GLUE;
  }
  if (game.input.keyboard.downDuration("B".charCodeAt(0), d) &&
     this.bagCount > 0) {
    this.mode = Mode.BAG;
  }
  if (game.input.keyboard.downDuration("M".charCodeAt(0), d)) {
    this.mode = Mode.MOVE;
  }

  this.renderer.renderContents();
  this.renderer.renderArrows(this.level, this.boy.getX(), this.boy.getY(), this.mode);
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
  var contents;
  switch (this.mode) {
  case Mode.MOVE:
    this.boy.moveBy(dx, dy);
    if (this.level.getBoard(this.boy.getX(), this.boy.getY()) == Level.EXIT) {
      console.log("YOU WIN!");
    }
    contents = this.level.getContent(this.boy.getX(), this.boy.getY());
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
          console.log("YOU ARE STUCK!");
          contents.splice(i, 1);
        }
      } else if (obj instanceof Robot) {
        console.log("YOU LOSE!");
      }
    }
    break;

  case Mode.GLUE:
    contents = this.level.getContent(this.boy.getX() + dx, this.boy.getY() + dy);
    var r = this.level.getRobot(this.boy.getX() + dx, this.boy.getY() + dy);
    if (!r) {
      this.level.addEntity(Item.create(this.boy.getX() + dx, this.boy.getY() + dy,
                                       Item.GLUE_STAIN, 1));
      this.glueCount -= 1;
      this.mode = Mode.MOVE;
    } else {
      r.setGlued();
      this.glueCount -= 1;
      this.mode = Mode.MOVE;
    }
    break;

  case Mode.BAG:
    contents = this.level.getContent(this.boy.getX() + dx, this.boy.getY() + dy);
    for (var i = 0; i < contents.length; ++i) {
      if (contents[i] instanceof Robot) {
        // contents[i].bagRobot();
        this.bagCount -= 1;
        this.mode = Mode.MOVE;
        break;
      }
    }
    break;
  }

  // Look for robot moves
  var moves = [];
  for (var i = 0; i < this.level.getWidth(); ++i) {
    for (var j = 0; j < this.level.getHeight(); ++j) {
      var content = this.level.getContent(i, j);
      for (var k = 0; k < content.length; ++k) {
        var obj = content[k];
        if (obj instanceof Robot) {
          var move = this.stepRobot(obj);
          if (!!move) {
            moves.push(move);
          }
        }
      }
    }
  }
  for (var i = 0; i < moves.length; ++i) {
    var move = moves[i];
    var r = move.getRobot();
    r.moveBy(move.getDx(), move.getDy());
    if ((r.getX() == this.boy.getX()) && (r.getY() == this.boy.getY())) {
      console.log("ROBOT HIT YOU");
    }
  }
};

gameState.stepRobot = function(r) {
  if (r.isGlued()) {
    return;
  }
  var dx = Math.sign(this.boy.getX() - r.getX());
  var dy = Math.sign(this.boy.getY() - r.getY());
  // If not on same line or column, nothing
  if (dx != 0 && dy != 0) {
    return;
  }
  var d = Math.max(Math.abs(this.boy.getX() - r.getX()),
                   Math.abs(this.boy.getY() - r.getY()));
  // If wall, no visibility
  for (var i = 1; i < d; ++i) {
    if (this.level.getBoard(r.getX() + dx * i, r.getY() + dy * i) == Level.WALL) {
      return;
    }
  }
  // Ok, robot moves
  return new RobotMove(r, dx, dy);
};

// Wrap it up
game.state.add("menu", menuState);
game.state.add("game", gameState);
game.state.start("game");
