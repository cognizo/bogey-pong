var Phaser = require('phaser-unofficial');
var colors = require('./colors');

/**
 * Paddle class.
 * @class
 * @param {object}  game
 * @param {number}  x
 * @param {number}  y
 * @param {boolean} isGhost
 */
Paddle = function (game, x, y, isGhost) {
    Phaser.Sprite.call(this, game, x, y, 'paddle');

    this.game = game;
    this.game.physics.arcade.enable(this);
    this.scale.x = 0.4;
    this.scale.y = 7;
    this.anchor.setTo(0.5, 0.5);
    this.body.bounce.setTo(1, 1);
    this.body.immovable = true;
    this.body.collideWorldBounds = true;
    this.alpha = Paddle.defaultAlpha;
    this.tint = colors.themes[this.game.theme].paddle;
    this.isGhost = isGhost || false;
    this.alive = true;
};

Paddle.prototype = Object.create(Phaser.Sprite.prototype);
Paddle.prototype.constructor = Paddle;

Paddle.defaultAlpha = 0.6;

/**
 * Phaser update.
 * @public
 */
Paddle.prototype.update = function () {
    if (this.game.pongPaused) {
        this.body.velocity.set(0);
    }

    // If this is the master paddle, move it to the closest ball.
    if (this.closestBall && !this.isGhost) {
        var yDiff = 0;

        if (this.y > this.closestBall.dest.y) {
            yDiff = this.y - this.closestBall.dest.y;
        } else {
            yDiff = this.closestBall.dest.y - this.y;
        }

        if (yDiff < 30) {
            this.body.velocity.set(0);
        } else {
            this.game.physics.arcade.moveToXY(
                this,
                Math.round(this.x),
                Math.round(this.closestBall.dest.y),
                100,
                this.closestBall.arrival * 1000
            );
        }
    }

    this.tint = colors.hexStringToInt(colors.themes[this.game.theme].paddle);

    // Fade out ghost paddles.
    if (this.isGhost) {
        // If we're paused, remove them immediately.
        if (this.game.pongPaused) {
            this.alpha = 0;
        }

        this.alpha -= 0.1;
        if (this.alpha < 0) {
            this.alpha = 0;
            this.alive = false;
        }

        return;
    }

    this.alpha -= 0.05;
    if (this.alpha < 0.6) {
        this.alpha = 0.6;
    }

    this._keyboard();

    Phaser.Sprite.prototype.update.call(this);
};

/**
 * Handle keyboard.
 * @private
 */
Paddle.prototype._keyboard = function () {
    if (this.game.pongPaused || !this.game.playMode) {
        return;
    }

    var yVelocity = 0;

    if (this.game.downKey.isDown) {
        yVelocity = 300;
    }

    if (this.game.upKey.isDown) {
        yVelocity = -300;
    }

    this.body.velocity.y = yVelocity;
};


module.exports = Paddle;
