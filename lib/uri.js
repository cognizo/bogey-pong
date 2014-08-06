var Phaser = require('phaser-unofficial');
var colors = require('./colors');

/**
 * Uri class.
 * @param {object} game
 * @param {number} x
 * @param {number} y
 * @param {string} text
 * @param {number} colorIndex
 */
Uri = function (game, x, y, text, colorIndex) {
    Phaser.Text.call(this, game, x, y, text, {
        font: '13px Roboto',
        fill: '#ffffff'
    });

    this.alive = true;
    this.alpha = 0;
    this.colorIndex = colorIndex;
    this.tint = colors.getColor(this.game, this.game.theme, this.colorIndex, true);
    this.anchor.set(0, 0.5);
    this.state = 'entering';
};

Uri.prototype = Object.create(Phaser.Text.prototype);
Uri.prototype.constructor = Uri;

/**
 * Phaser update.
 * @public
 */
Uri.prototype.update = function () {
    if (this.game.pongPaused) {
        return;
    }

    switch (this.state) {
        case 'entering':
            this.alpha += 0.05;

            if (this.alpha > 1) {
                this.alpha = 1;
                this.state = 'waiting';
                this.waitTime = 0;
            }
            break;

        case 'waiting':
            this.waitTime += this.game.time.elapsed;

            if (this.waitTime > 2000) {
                this.state = 'leaving';
            }
            break;

        case 'leaving':
            this.x += 10;
            this.alpha -= 0.03;
            if (this.alpha < 0) {
                this.alpha = 0;
            }

            if (this.x > this.game.world.bounds.width) {
                this.alive = false;
            }
            break;
    }

    this.tint = colors.getColor(this.game, this.game.theme, this.colorIndex, true);

    Phaser.Text.prototype.update.call(this);
};

module.exports = Uri;
