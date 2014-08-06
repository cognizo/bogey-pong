var gulp = require('gulp');
var browserify = require('browserify');
var watchify = require('watchify');
var streamify = require('gulp-streamify');
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream');
var notify = require('gulp-notify');
var packageJson = require(__dirname + '/package.json');

gulp.task('build', function () {
    return browserify('./index.js')
        .require('./index.js', { expose: packageJson.name })
        .bundle()
        .pipe(source('index.js'))
        .pipe(streamify(uglify()))
        .pipe(gulp.dest('dist/'))
});

gulp.task('default', [ 'build' ]);
