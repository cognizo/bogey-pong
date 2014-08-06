var Phaser = require('phaser-unofficial');
var colors = require('./colors');

/**
 * Ball class.
 * @class
 * @param {object} game
 * @param {object} request
 * @param {number} x
 * @param {number} y
 * @param {object} options
 */
Ball = function (game, request, x, y, options) {
    Phaser.Sprite.call(this, game, x, y, 'ball');

    var self = this;

    this.game = game;
    this.game.physics.arcade.enable(self);
    this.inputEnabled = true;
    this.z = 10;
    this.dest = options.destination;
    this.colorIndex = options.colorIndex || colors.randomColorIndex(this.game, this.game.theme);
    this.tint = colors.getColor(this.game, this.game.theme, this.colorIndex, true);
    this.speed = options.speed || Ball.defaultSpeed;
    this.alive = true;
    this.anchor.set(0.5, 0.5);
    this.checkWorldBounds = true;
    this.body.bounce.setTo(1, 1);
    this.returned = false;
    this.request = request;
    this.pongScale = options.scale || this.game.rnd.integerInRange(30, 40) / 100;
    this.scale.x = this.pongScale;
    this.scale.y = this.pongScale;

    this.alpha = 1;

    if (options.miss) {
        this.alpha = 0.4;
    }

    if (options.error) {
        this.scale.x = 0.5;
        this.scale.y = 0.5;
        this.isError = true;
        this.tint = colors.hexStringToInt(colors.themes[this.game.theme].red);
        this.state = 'fadeOut';
    }

    this.minAlpha = Ball.minAlpha;
    this.maxAlpha = Ball.maxAlpha;

    this.body.velocity = this.game.physics.arcade.velocityFromAngle(
        this.game.physics.arcade.angleToXY(this.body, this.dest.x, this.dest.y) * (180 / Math.PI),
        this.speed
    );

    this.currentVelocity = {
        x: this.body.velocity.x,
        y: this.body.velocity.y
    };

    this.glow = this._createGlow();
    this.addChild(this.glow);

    // Mouse over events.
    this.events.onInputOver.add(this._inputOver, this);
    this.events.onInputOut.add(this._inputOut, this);
};

Ball.prototype = Object.create(Phaser.Sprite.prototype);
Ball.prototype.constructor = Ball;

Ball.defaultSpeed = 250;
Ball.minGlowAlpha = 0.2;
Ball.maxGlowAlpha = 0.6;
Ball.maxYVelocity = 100;

/**
 * Phaser update.
 * @public
 */
Ball.prototype.update = function () {
    if (this.isOutOfBounds()) {
        this.alive = false;
    }

    this._updateGlow();

    if (this.game.pongPaused) {
        this.body.velocity.set(0);
        return;
    }

    this.body.velocity.x = this.currentVelocity.x * this.game.speed;
    this.body.velocity.y = this.currentVelocity.y * this.game.speed;

    if (this.isError) {
        switch (this.state) {
            case 'fadeIn':
                this.alpha += 0.07;
                if (this.alpha > 1) {
                    this.alpha = 1;
                    this.state = 'fadeOut';
                }
                break;

            case 'fadeOut':
                this.alpha -= 0.07;
                if (this.alpha < 0.3) {
                    this.alpha = 0.3;
                    this.state = 'fadeIn';
                }
                break;
        }

        this.tint = colors.hexStringToInt(colors.themes[this.game.theme].red);
    } else {
        this.tint = colors.getColor(this.game, this.game.theme, this.colorIndex, true);
    }

    Phaser.Sprite.prototype.update.call(this);
};

/**
 * Is the ball out of the game area?
 * @public
 * @returns {boolean}
 */
Ball.prototype.isOutOfBounds = function () {
    return this.x < 0 || this.x > this.game.world.bounds.width || this.y < 0 || this.y > this.game.world.bounds.height;
};

/**
 * Handle the ball colliding with a paddle.
 * @param {object} paddle
 * @public
 */
Ball.prototype.collideWithPaddle = function (paddle) {
    var self = this

    this.returned = true;

    // Let the ball fly off the screen.
    this.body.collideWorldBounds = false;

    this.body.velocity.x = -this.speed;

    if (this.y < paddle.y) {
        // Ball hit the top side of the paddle.
        this.body.velocity.y = -5 * (paddle.y - this.y);
    } else if (this.y > paddle.y) {
        // Ball hit the bottom side of the paddle.
        this.body.velocity.y = 5 * (this.y - paddle.y);
    } else {
        // Ball hit the center of the paddle.
        this.body.velocity.y = 0;
    }

    // We don't want the ball to go too vertical.
    if (this.body.velocity.y < -Ball.maxYVelocity) {
        this.body.velocity.y = -Ball.maxYVelocity;
    }

    if (this.body.velocity.y > Ball.maxYVelocity) {
        this.body.velocity.y = Ball.maxYVelocity;
    }

    self.currentVelocity = {
        x: this.body.velocity.x,
        y: this.body.velocity.y
    };
};

/**
 * Create the glow object.
 * @private
 * @returns {object}
 */
Ball.prototype._createGlow = function () {
    var glow = this.game.add.sprite(0, 0, 'ball');

    glow.tint = self.tint;
    glow.blendMode = colors.themes[this.game.theme].blendMode;
    glow.scale.x = this.scale.x + 1.4;
    glow.scale.y = this.scale.y + 1.4;
    glow.z = 20;
    glow.anchor = new Phaser.Point(0.5, 0.5);

    glow.alpha = (this.game.rnd.integerInRange(2, 6) / 10) * colors.themes[this.game.theme].glowIntensity;
    glow.state = this.game.rnd.pick([ 'fadeIn', 'fadeOut' ]);

    return glow;
};

/**
 * Update the glow.
 * @private
 */
Ball.prototype._updateGlow = function () {
    var alpha = this.glow.alpha / colors.themes[this.game.theme].glowIntensity;

    switch (this.glow.state) {
        case 'fadeIn':
            alpha += 0.005;

            if (alpha > Ball.maxGlowAlpha) {
                this.glow.state = 'fadeOut';
            }
            break;

        case 'fadeOut':
            alpha -= 0.005;

            if (alpha < Ball.minGlowAlpha) {
                this.glow.state = 'fadeIn';
            }
            break;

        case 'highlightIn':
            this.glow.alpha += 0.05;
            if (this.glow.alpha > 0.9) {
                this.glow.alpha = 0.9;
            }
            break;

        case 'highlightOut':
            this.glow.alpha -= 0.05;
            if (this.glow.alpha < 0.2) {
                this.glow.state = 'fadeIn';
            }
            break;
    }

    this.glow.tint = this.tint;
    this.glow.alpha = alpha * colors.themes[this.game.theme].glowIntensity;
    this.glow.blendMode = colors.themes[this.game.theme].blendMode;
};

/**
 * Handle the onInputOver event.
 * @private
 */
Ball.prototype._inputOver = function () {
    this.glow.state = 'highlightIn';
};

/**
 * Handle the onInputOut event.
 * @private
 */
Ball.prototype._inputOut = function () {
    this.glow.state = 'highlightOut';
};

module.exports = Ball;
