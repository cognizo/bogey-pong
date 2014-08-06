var Phaser = require('phaser-unofficial');

ScreenShake = function (game, parent) {
    Phaser.Plugin.call(this, game, parent);
    this.screenShakes = 0;
    this.shakedAt = 0;
};

ScreenShake.prototype = Object.create(Phaser.Plugin.prototype);
ScreenShake.prototype.constructor = ScreenShake;

ScreenShake.prototype.start = function (count) {
    if(this.game.time.now - this.shakedAt < 200) {
        return;
    }

    this.shakedAt = this.game.time.now;
    this.screenShakes = count;

    if (window.navigator && window.navigator.vibrate) {
        navigator.vibrate(count * 10);
    }
};

ScreenShake.prototype.postUpdate = function () {
    if (this.screenShakes > 0) {
        this.screenShakes--;
        var amt = this.screenShakes * 0.5;

        if (this.screenShakes % 2) {
            this.game.camera.y += amt;
        } else {
            this.game.camera.y -= amt;
        }

        this.game.camera.displayObject.position.y = -this.game.camera.view.y;
    }
};

module.exports = ScreenShake;
