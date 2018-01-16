var gulp = require('gulp');
var babel = require('gulp-babel');
var nodemon = require('gulp-nodemon');
var sequence = require('run-sequence');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var sass = require('gulp-sass');
var rev = require('gulp-rev');
var revdel = require('gulp-rev-delete-original');
var revdelversionfile = require('rev-del');
var clean = require('gulp-clean');
var watch = require('gulp-watch');
var concat = require('gulp-concat');
var override = require('gulp-rev-css-url');

var path = {
  node_modules : './node_modules'
};

// Watch
gulp.task('watch', function(){
  //watch(['./**/*.js', '!./node_modules/**', '!./resources/assets/js/**', '!./public/js/**'], function(event, cb){});
  gulp.watch('resources/assets/sass/**/*.{scss,css}', ['version']);
  gulp.watch('resources/assets/js/**/*.js', ['version']);
  gulp.watch('resources/assets/images/**/*.{png,jpg,jpeg,gif,svg,ico}', ['version']);
  gulp.watch('resources/assets/vendors/plugins/**/*.{png,jpg,jpeg,gif,svg,ico,js,css,scss,eot,svg,ttf,woff}', ['version']);
});

// compile scss by gulp-sass
gulp.task('styles', function() {
  return gulp.src('resources/assets/sass/**/*.{scss,css}')
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(gulp.dest('./public/css/'));
});

// compile scss by gulp-sass
gulp.task('js_build', function() {
  return gulp.src('resources/assets/js/**/*.js')
    .pipe(gulp.dest('./public/js/'));
});

// copy images to public/images
gulp.task('copy_images', function() {
  return gulp.src('resources/assets/images/**/*.{png,jpg,jpeg,gif,svg,ico}')
    .pipe(gulp.dest('./public/images/'));
});

// copy vendors/plugins to public/vendors/plugins
gulp.task('copy_vendors_plugins', function() {
  return gulp.src('resources/assets/vendors/plugins/**/*.{png,jpg,jpeg,gif,svg,ico,js,css,scss,eot,svg,ttf,woff}')
    .pipe(gulp.dest('./public/vendors/plugins/'));
});

// vendors
gulp.task('common_vendors', function() {
  return gulp.src([
    'resources/assets/vendors/common/jquery/jquery.min.js',
    'resources/assets/vendors/common/fontawesome/js/fa-solid.min.js',
    'resources/assets/vendors/common/fontawesome/js/fontawesome.min.js',
    'resources/assets/vendors/common/bootstrap/js/bootstrap.min.js'
    //'./node_modules/scrollmagic/scrollmagic/minified/ScrollMagic.min.js',
    //'./node_modules/moment/min/moment-with-locales.min.js'
  ]).pipe(concat('v.js'))
    .pipe(gulp.dest('./public/vendors/common/'));
});

// version
gulp.task('version', ['styles', 'js_build', 'copy_images', 'copy_vendors_plugins', 'common_vendors'], function(){ // 表示執行 version 之前，會先執行 styles、js_build、copy_images、common_vendors
  return gulp.src(
    [
      './public/css/**/*.css',
      './public/images/**/*.{png,jpg,jpeg,gif,svg,ico}',
      './public/js/**/*.js',
      './public/vendors/**/*.{png,jpg,jpeg,gif,svg,ico,js,css,scss,eot,svg,ttf,woff}'
    ], {base: './public'}
  ).pipe(rev())
   .pipe(override())
    .pipe(revdel()) // remove original css file in public/css directory
    .pipe(gulp.dest('./public/build'))
    .pipe(rev.manifest())
    .pipe(revdelversionfile({ dest: './public/build' })) // remove old version file
    .pipe(gulp.dest('./public/build'));
});

// restart server by gulp-nodemon
gulp.task('start', function(){
    nodemon({
        //watch: '.',
        script: 'public/imagebase.js',
        ext: 'js scss'
        //env: { 'NODE_ENV': 'development' }
    });
});

// task order by gulp-sequence
gulp.task('default', function(callback){
    sequence('watch', 'version', 'start', callback);
});
