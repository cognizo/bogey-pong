var Phaser = require('phaser-unofficial');

/**
 * Wall class.
 * @param {object} game
 * @param {number} x
 * @param {number} y
 */
Wall = function (game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'paddle');

    this.game.physics.arcade.enable(this);
    this.width = 200;
    this.height = this.game.world.bounds.height;
    this.blendMode = Phaser.blendModes.ADD;
    this.body.bounce.setTo(1, 1);
    this.body.immovable = true;
    this.alpha = 0;
};

Wall.prototype = Object.create(Phaser.Sprite.prototype);
Wall.prototype.constructor = Wall;

module.exports = Wall;
