var fs = require('fs');
var $ = require('jquery');
var _ = require('underscore');
var Phaser = require('phaser-unofficial');
var store = require('store');
var Paddle = require('./paddle');
var Wall = require('./wall');
var Ball = require('./ball');
var Explosion = require('./explosion');
var Ip = require('./ip');
var Uri = require('./uri');
var Status = require('./status');
var ScreenShake = require('./shake');
var colors = require('./colors');

/**
 * @class
 * @param {object} bogey
 */
Pong = function (bogey) {
    var self = this;

    this.bogey = bogey;

    bogey.registerKey('t', 'Change theme', this._changeTheme, this);
    bogey.registerKey('p', 'Play mode', this._togglePlayMode, this);

    // Don't start until fonts are loaded.
    window.WebFontConfig = {
        active: function () {
            self.start();
        },

        google: {
          families: [ 'Roboto:400', 'Source Code Pro:200' ]
        }
    };

    $.getScript('//ajax.googleapis.com/ajax/libs/webfont/1.5.3/webfont.js');
};

Pong.minSpeed = 0.2;
Pong.maxSpeed = 2;
Pong.defaultSpeed = 1;
Pong.defaulttheme = 'Bogey';
Pong.sectionSize = 20;
Pong.padding = 15;

/**
 * Start the visualization.
 * @public
 */
Pong.prototype.start = function () {
    var self = this;

    var renderer = Phaser.AUTO;

    if (this.bogey.params.renderer === 'canvas') {
        renderer = Phaser.CANVAS;
    }

    if (this.bogey.params.renderer === 'webgl') {
        renderer = Phaser.WEBGL;
    }

    this.game = new Phaser.Game(
        $(this.bogey.container).width() + 40,
        $(this.bogey.container).height() + 40,
        renderer,
        this.bogey.container,
        {
            preload: function () {
                self._preload();
            },
            create: function () {
                self._create();
            },
            update: function () {
                self._update();
            }
        }
    );

    this.game.pongPaused = false;
    this.game.theme = store.get('theme') || Pong.defaulttheme;

    this.bogey.setMessageColor(colors.themes[this.game.theme].paddle);
    this.bogey.setMessageFont('Roboto');

    this.game.speed = 1;
    this.stats = false;
    this.requests = [];
};

/**
 * Handle the request event from Bogey.
 * @param  {object} request
 * @public
 */
Pong.prototype.request = function (request) {
    if (this.requests) {
        this.requests.push(request);
    }
};

/**
 * Handle the pause event from Bogey. Not using the Phaser 'paused' attribute since we want to enable some interaction
 * while paused.
 * @public
 */
Pong.prototype.pause = function () {
    this.game.pongPaused = true;
};

/**
 * Handle the unpause event from Bogey.
 * @public
 */
Pong.prototype.unpause = function () {
    this.game.pongPaused = false;
}

/**
 * Handle the speedUp event from Bogey.
 * @public
 */
Pong.prototype.speedUp = function () {
    this._setSpeed(this.game.speed + 0.1);
};

/**
 * Handle the slowDown event from Bogey.
 * @public
 */
Pong.prototype.slowDown = function () {
    this._setSpeed(this.game.speed - 0.1);
};

/**
 * Set the speed back to default.
 * @public
 */
Pong.prototype.defaultSpeed = function () {
    this._setSpeed(Pong.defaultSpeed);
};

/**
 * Set the speed.
 * @param {number} speed
 * @private
 */
Pong.prototype._setSpeed = function (speed) {
    this.game.speed = speed;

    if (this.game.speed < Pong.minSpeed) {
        this.game.speed = Pong.minSpeed;
    }

    if (this.game.speed > Pong.maxSpeed) {
        this.game.speed = Pong.maxSpeed;
    }

    this._displayMessage('Speed ' + this.game.speed.toFixed(1));
};

/**
 * Phaser preload function. Loads required assets.
 * @private
 */
Pong.prototype._preload = function () {
    var paddle = fs.readFileSync(__dirname + '/../assets/paddle.png', 'base64');
    this.game.load.spritesheet('paddle', 'data:image/png;base64,' + paddle, 16, 16, 1);

    var ball = fs.readFileSync(__dirname + '/../assets/ball.png', 'base64');
    this.game.load.spritesheet('ball', 'data:image/png;base64,' + ball, 32, 32, 1);
};

/**
 * Phaser create function. Sets up the game environment.
 * @private
 */
Pong.prototype._create = function () {
    var self = this;

    // Fit the camera to the window size.
    this.game.camera.width = $(window).width();
    this.game.camera.height = $(window).height();

    // Restrict the game to the window size.
    this.game.world.bounds.width = $(window).width();
    this.game.world.bounds.height = $(window).height();

    var screenShake = this.game.plugins.add(ScreenShake);
    this.game.plugins.screenShake = screenShake;

    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    var backgroundColor = Phaser.Color.hexToColor(colors.themes[this.game.theme].background);

    this.startBackgroundColor = backgroundColor;
    this.backgroundColor = backgroundColor;

    // Ball group.
    this.ballGroup = this.game.add.group();
    this.ballGroup.enableBody = true;

    // Explosion group.
    this.explosionGroup = this.game.add.group();

    // Paddle clone group.
    this.paddleGhostGroup = this.game.add.group();

    // Create the paddle.
    this.paddle = new Paddle(this.game, this.game.world.bounds.width - 500, this.game.world.centerY);
    this.game.world.add(this.paddle);

    // Create the hidden wall.
    this.wall = new Wall(this.game, this.paddle.x - 3, 0);
    this.game.world.add(this.wall);

    // Text groups.
    this.ipGroup = this.game.add.group();
    this.uriGroup = this.game.add.group();
    this.statusGroup = this.game.add.group();

    // Divide the vertical space into equal sections.
    this.leftSections = this._createSections(0);
    this.rightSections = this._createSections(this.paddle.x);

    this._setKeys();
};

/**
 * Divides the vertical game space into equal sections.
 * @private
 * @param {number} x
 */
Pong.prototype._createSections = function (x) {
    var numSections = (this.game.world.bounds.height - Pong.padding * 2) / Pong.sectionSize;
    var sections = [];
    var sectionY = Pong.padding;

    for (var i = 0; i < numSections; i++) {
        sections.push({
            index: i,
            x: x,
            y: sectionY,
            time: 0
        });

        sectionY += Pong.sectionSize;
    }

    return sections;
};

/**
 * Set up game keys.
 * @private
 */
Pong.prototype._setKeys = function () {
    // UP / DOWN. Controls the paddle in play mode.
    this.game.downKey = this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
    this.game.upKey = this.game.input.keyboard.addKey(Phaser.Keyboard.UP);
};

/**
 * Phaser update function. This is the main game loop.
 * @private
 */
Pong.prototype._update = function () {
    if (!this.game.pongPaused) {
        while (this.requests.length) {
            this._addRequest(this.requests.pop());
        }
    }

    this._updateBackground();
    this._updateBalls();
    this._removeDeadObjects();
};

/**
 * Toggle play mode.
 * @private
 */
Pong.prototype._togglePlayMode = function () {
    var self = this;

    self.game.playMode = !self.game.playMode;

    self._displayMessage('Play mode ' + (self.game.playMode ? 'enabled' : 'disabled'));
};

/**
 * Change the theme.
 * @private
 */
Pong.prototype._changeTheme = function () {
    var self = this;

    var keys = _.keys(colors.themes);
    var index = keys.indexOf(self.game.theme);

    var nextIndex = index < keys.length - 1 ? index + 1 : 0;

    self.game.theme = keys[nextIndex];

    var backgroundColor = Phaser.Color.hexToColor(colors.themes[self.game.theme].background);

    self.backgroundColor = backgroundColor;
    self.startBackgroundColor = backgroundColor;

    store.set('theme', self.game.theme);

    self.bogey.setMessageColor(colors.themes[self.game.theme].paddle);

    self._displayMessage(self.game.theme);
};

/**
 * Display a message on the screen.
 * @private
 * @param {string} text
 */
Pong.prototype._displayMessage = function (text) {
    var self = this;

    self.bogey.flashMessage(text);
};

/**
 * Add a request. This creates a ball that flies in from the left.
 * @private
 * @param {object} request
 */
Pong.prototype._addRequest = function (request) {
    var self = this;

    // Check if there is an existing IP address.
    var leftSections = _.shuffle(this.leftSections),
        leftSection;

    leftSections.forEach(function (section) {
        if (section.ip && section.ip.alive && section.ip.ip === request.parsed.ip[0]) {
            leftSection = section;
            section.ip.state = 'entering';
        }
    });

    if (!leftSection) {
        // Use the oldest left section.
        leftSection = this._getOldestSection(leftSections);
        leftSection.colorIndex = null;
    }

    leftSection.request = request;
    leftSection.time = this.game.time.now;

    // Check if there is an existing target for this IP address.
    var rightSections = _.shuffle(this.rightSections),
        rightSection;

    rightSections.forEach(function (section) {
        if (section.request && section.request.parsed.ip[0] === request.parsed.ip[0]) {
            rightSection = section;
        }
    });

    if (!rightSection) {
        // Use the oldest right section.
        rightSection = this._getOldestSection(rightSections);
    }

    rightSection.request = request;
    rightSection.time = self.game.time.now;

    this.rightSections[rightSection.index] = rightSection;

    // Add the ball.
    var ball = new Ball(this.game, request, 0, leftSection.y, {
        destination: rightSection,
        colorIndex: leftSection.colorIndex,
        speed: leftSection.speed,
        scale: leftSection.scale,
        miss: request.parsed.statusCode[0].toString().slice(0, 1) === '4',
        error: request.parsed.statusCode[0].toString().slice(0, 1) === '5'
    });
    self.ballGroup.add(ball);

    leftSection.colorIndex = ball.colorIndex;
    leftSection.speed = ball.speed;
    leftSection.pongScale = ball.pongScale;
    this.leftSections[leftSection.index] = leftSection;

    if (!leftSection.ip || leftSection.ip.ip !== request.parsed.ip[0]) {
        // Add the IP address.
        var ip = new Ip(this.game, 0, leftSection.y, request.parsed.ip[0], ball.colorIndex);
        this.ipGroup.add(ip);

        leftSection.ip = ip;
    }
};

/**
 * Find the section with the oldest request.
 * @param {array} sections
 * @returns {object}
 * @private
 */
Pong.prototype._getOldestSection = function (sections) {
    sections.sort(function (a, b) {
        return a.time - b.time;
    });

    return sections[0];
};

/**
 * Update the background color.
 * @private
 */
Pong.prototype._updateBackground = function () {
    this.game.stage.backgroundColor = colors.hexStringToInt(colors.themes[this.game.theme].background);
};

/**
 * Perform updates on all balls.
 * @private
 */
Pong.prototype._updateBalls = function (request) {
    var self = this;
    var closestBall;

    self.ballGroup.forEach(function (ball) {
        // Remove dead balls.
        if (typeof ball === 'undefined' || !ball.alive) {
            self.ballGroup.remove(ball);
            return;
        }

        if (self.game.pongPaused) {
            return;
        }

        // If the ball has already hit the wall, we're done with it.
        if (ball.returned === true) {
            return;
        }

        var statusCode = ball.request.parsed.statusCode[0];

        // Show 404s when they cross the paddle line.
        if (statusCode.slice(0, 1) === '4' && ball.x > self.paddle.x) {
            if (!ball.statusShown) {
                var status = new Status(self.game, self.paddle.x - 15, ball.dest.y, statusCode);
                self.statusGroup.add(status);
                ball.statusShown = true;
            }

            if (!ball.uriShown) {
                self._addUri(ball, self.paddle);
            }
        }

        // 404s are misses.
        if (statusCode.slice(0, 1) === '4') {
            return;
        }

        // Check for the next ball to arrive.
        ball.arrival = self.game.physics.arcade.distanceToXY(ball, ball.dest.x, ball.dest.y) / ball.speed;

        if (!closestBall || ball.arrival < closestBall.arrival) {
            closestBall = ball;
        }

        self._checkForCollisions(ball);
    });

    this.paddle.closestBall = closestBall;
};

/**
 * Check for ball collisions.
 * @param {object} ball
 */
Pong.prototype._checkForCollisions = function (ball) {
    var self = this;

    // Check for collisions with the paddle.
    self.game.physics.arcade.collide(ball, self.paddle, function (ball) {
        self._handleCollision(ball, self.paddle);
    }, null, this);

    // If not in play mode, check for collisions with the wall and create a ghost paddle so it doesn't look like we
    // missed the ball.
    if (!self.game.playMode) {
        self.game.physics.arcade.collide(ball, self.wall, function (ball, wall) {
            var paddleClone = new Paddle(self.game, self.paddle.x, ball.y, true);
            self.paddleGhostGroup.add(paddleClone);

            self._handleCollision(ball, paddleClone);
        }, null, this);
    }
};

/**
 * Handle a collision between a ball and a paddle.
 * @param {object} ball
 * @param {object} paddle
 * @private
 */
Pong.prototype._handleCollision = function (ball, paddle) {
    ball.collideWithPaddle(paddle);

    paddle.alpha = 1;

    if (ball.request.parsed.statusCode[0].toString().slice(0, 1) === '5') {
        this.ballGroup.remove(ball);

        var explosion = new Explosion(
            this.game,
            paddle.x - 2,
            ball.y,
            colors.hexStringToInt(colors.themes[this.game.theme].red),
            true
        );
        this.explosionGroup.add(explosion);

        this.game.plugins.screenShake.start(30);
    }

    // Create the explosion effect.
    var explosion = new Explosion(this.game, paddle.x - 2, ball.y, ball.tint, false);
    this.explosionGroup.add(explosion);

    this._addUri(ball, paddle);

    // Show the status code.
    var status = new Status(this.game, this.paddle.x - 15, ball.y, ball.request.parsed.statusCode[0]);
    this.statusGroup.add(status);
};

/**
 * Display a URI.
 * @param {object} ball
 * @param {object} paddle
 */
Pong.prototype._addUri = function (ball, paddle) {
    // If the right section already has a URI, make it leave.
    if (ball.dest.uri && ball.dest.uri.alive) {
        ball.dest.uri.state = 'leaving';
    }

    // Create the URI.
    var uri = new Uri(this.game, paddle.x + 10, ball.dest.y, ball.request.parsed.uri[0], ball.colorIndex);
    this.uriGroup.add(uri);

    ball.dest.uri = uri;
    ball.uriShown = true;
};

/**
 * Remove dead objects.
 * @private
 */
Pong.prototype._removeDeadObjects = function () {
    var self = this;

    // Remove dead paddles.
    this.paddleGhostGroup.forEach(function (paddle) {
        if (typeof paddle === 'undefined' || !paddle.alive) {
            self.paddleGhostGroup.remove(paddle);
        }
    });

    // Remove dead explosions.
    this.explosionGroup.forEach(function (explosion) {
        if (typeof explosion === 'undefined' || !explosion.alive) {
            self.explosionGroup.remove(explosion);
        }
    });

    // Remove dead IPs.
    this.ipGroup.forEach(function (ip) {
        if (typeof ip === 'undefined' || !ip.alive) {
            self.ipGroup.remove(ip);
        }
    });

    // Remove dead URIs.
    this.uriGroup.forEach(function (uri) {
        if (typeof uri === 'undefined' || !uri.alive) {
            self.uriGroup.remove(uri);
        }
    });

    // Remove dead statuses.
    this.statusGroup.forEach(function (status) {
        if (typeof status === 'undefined' || !status.alive) {
            self.statusGroup.remove(status);
        }
    });
};

module.exports = Pong;
