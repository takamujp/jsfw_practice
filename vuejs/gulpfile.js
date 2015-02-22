'use strict';
var gulp = require('gulp');
var bowerFiles = require('main-bower-files');


gulp.task('bower', function () {
    console.log(bowerFiles());
    return gulp.src(bowerFiles()).pipe(gulp.dest('./lib'));
});