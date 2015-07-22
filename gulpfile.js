var gulp = require('gulp');
var uglify = require('gulp-uglify');
var htmlmin = require('gulp-html-minifier');
var minifyCss = require('gulp-minify-css');

gulp.task('js-min', function() {
  return gulp.src('./src/js/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('js'));
});

gulp.task('html-min', function() {
  gulp.src('./src/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('./'));
});

gulp.task('css-min', function() {
  return gulp.src('./src/css/*.css')
    .pipe(minifyCss({compatibility: 'ie8'}))
    .pipe(gulp.dest('css'));
});