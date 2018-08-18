'use strict';

var gulp = require('gulp');

var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');

var cssmqpacker = require('css-mqpacker');

var sass = require('gulp-sass');

gulp.task('sass', function () {
    return gulp.src('./asset/sass/style.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([autoprefixer(), cssnano(), cssmqpacker()]))
        .pipe(gulp.dest('./public/css/'));
});

gulp.task('watch', function () {
    gulp.watch('./asset/sass/**/*.scss', ['sass']);
    gulp.watch('./asset/js/**/*.js', ['bundle']);
});