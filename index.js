var fs = require('fs');
var Pong = require('./lib/pong');

var thumbnail = fs.readFileSync(__dirname + '/assets/thumbnail.png', 'base64');

module.exports = {
    bogey: {
        name: 'Pong',
        thumbnail: 'data:image/png;base64,' + thumbnail,
        run: function (bogey) {
            var pong = new Pong(bogey);

            bogey.on('request', function (data) {
                pong.request(data);
            });

            bogey.on('pause', function () {
                pong.pause();
            });

            bogey.on('play', function () {
                pong.unpause();
            });

            bogey.on('speedUp', function () {
                pong.speedUp();
            });

            bogey.on('slowDown', function () {
                pong.slowDown();
            });

            bogey.on('defaultSpeed', function () {
                pong.defaultSpeed();
            });
        }
    }
};
