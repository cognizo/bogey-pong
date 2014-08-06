var Phaser = require('phaser-unofficial');
var colors = require('./colors');

/**
 * Status class.
 * @class
 * @param {object} game
 * @param {number} x
 * @param {number} y
 * @param {string} text
 */
Status = function (game, x, y, text) {
    var color = '#ffffff';

    this.game = game;

    if (text.slice(0, 1) === '2' || text.slice(0, 1) === '3') {
        color = colors.themes[this.game.theme].green;
    } else if (text.slice(0, 1) === '4') {
        color = colors.themes[this.game.theme].yellow;
    } else if (text.slice(0, 1) === '5') {
        color = colors.themes[this.game.theme].red;
    }

    Phaser.Text.call(this, game, x, y, text, {
        font: '12px Source Code Pro',
        fill: color
    });

    this.alive = true;
    this.alpha = 0;
    this.state = 'fadeIn';
};

Status.prototype = Object.create(Phaser.Text.prototype);
Status.prototype.constructor = Status;

/**
 * Phaser update.
 * @public
 */
Status.prototype.update = function () {
    if (this.game.pongPaused) {
        return;
    }

    switch (this.state) {
        case 'fadeIn':
            this.alpha += 0.05;
            this.x -= 0.5;

            if (this.alpha > 1) {
                this.alpha = 1;
                this.state = 'fadeOut';
                this.waitTime = 0;
            }
            break;

        case 'fadeOut':
            this.alpha -= 0.02;
            this.x -= 0.5;

            if (this.alpha <= 0) {
                this.alive = false;
            }
            break;
    }

    Phaser.Text.prototype.update.call(this);
};

module.exports = Status;
