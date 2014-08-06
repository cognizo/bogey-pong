var Phaser = require('phaser-unofficial');

/**
 * Explosion class.
 * @class
 * @param {object} game
 * @param {number} x
 * @param {number} y
 * @param {string} tint
 * @param {boolean} giant
 */
Explosion = function (game, x, y, tint, giant) {
    this.game = game;

    var numParticles;

    if (giant) {
        numParticles = 30;
    } else {
        numParticles = this.game.rnd.integerInRange(10, 20);
    }

    Phaser.Particles.Arcade.Emitter.call(this, game, x, y, numParticles);

    this.alive = true;
    this.makeParticles('ball');
    this.minParticleScale = 0.02;
    this.maxParticleScale = 0.1;
    this.minParticleSpeed.setTo(-100, -250);
    this.maxParticleSpeed.setTo(-200, 250);
    this.tint = tint;

    if (giant) {
        this.minParticleScale = 0.05;
        this.maxParticleScale = 0.2;
    }

    this.minParticleAlpha = 0.1;
    this.maxParticleAlpha = 0.5;
    this.gravity = 150;
    this.bounce.setTo(0.5, 0.5);
    this.aliveTime = 0;

    this.start(true, 1000, 0, numParticles);
};

Explosion.prototype = Object.create(Phaser.Particles.Arcade.Emitter.prototype);
Explosion.prototype.constructor = Explosion;

Explosion.lifetime = 2000;

/**
 * Phaser update.
 * @public
 */
Explosion.prototype.update = function () {
    this.aliveTime += this.game.time.elapsed;

    if (this.aliveTime > Explosion.lifetime) {
        this.alive = false;
    }

    this._updateParticles();

    Phaser.Particles.Arcade.Emitter.prototype.update.call(this);
};

/**
 * Fade out the explosion's particles.
 * @private
 */
Explosion.prototype._updateParticles = function () {
    var self = this;

    this.forEach(function (p) {
        p.tint = self.tint;
        p.alpha = p.lifespan / self.lifespan;
    });
};

module.exports = Explosion;
