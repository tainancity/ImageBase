//var gulp = require('gulp');
const { src, dest, watch, series } = require('gulp');
var babel = require('gulp-babel');
var nodemon = require('gulp-nodemon');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var sass = require('gulp-sass');
var rev = require('gulp-rev');
var revdel = require('gulp-rev-delete-original');
var revdelversionfile = require('rev-del');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var override = require('gulp-rev-css-url');

var path = {
  node_modules : './node_modules'
};


// Watch
function watch_task(cb){
  watch('resources/assets/sass/**/*.{scss,css}', series(styles, js_build, copy_images, copy_vendors_plugins, common_vendors, version));
  watch('resources/assets/js/**/*.js', series(styles, js_build, copy_images, copy_vendors_plugins, common_vendors, version));
  watch('resources/assets/images/**/*.{png,jpg,jpeg,gif,svg,ico}', series(styles, js_build, copy_images, copy_vendors_plugins, common_vendors, version));
  watch('resources/assets/vendors/plugins/**/*.{png,jpg,jpeg,gif,svg,ico,js,css,scss,eot,svg,ttf,woff}', series(styles, js_build, copy_images, copy_vendors_plugins, common_vendors, version));
  cb();
}

// compile scss by gulp-sass
function styles(){
  src('resources/assets/sass/**/*.{ttf,woff}')
      .pipe(dest('./public/css/'));
  return src('resources/assets/sass/**/*.{scss,css}')
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(dest('./public/css/'));
}

// compile scss by gulp-sass
function js_build(){
  return src('resources/assets/js/**/*.js').pipe(dest('./public/js/'));
}

// copy images to public/images
function copy_images(){
  return src('resources/assets/images/**/*.{png,jpg,jpeg,gif,svg,ico}').pipe(dest('./public/images/'));
}

// copy vendors/plugins to public/vendors/plugins
function copy_vendors_plugins(){
  return src('resources/assets/vendors/plugins/**/*.{png,jpg,jpeg,gif,svg,ico,js,css,scss,eot,svg,ttf,woff}').pipe(dest('./public/vendors/plugins/'));
}

// vendors

function common_vendors(){
  return src([
    'resources/assets/vendors/common/jquery/jquery.min.js',
    'resources/assets/vendors/common/fontawesome/js/fa-solid.min.js',
    'resources/assets/vendors/common/fontawesome/js/fontawesome.min.js',
    'resources/assets/vendors/common/bootstrap/js/bootstrap.min.js'
    //'./node_modules/scrollmagic/scrollmagic/minified/ScrollMagic.min.js',
    //'./node_modules/moment/min/moment-with-locales.min.js'
  ]).pipe(concat('v.js'))
    .pipe(dest('./public/vendors/common/'));
}

// version
function version(cb){
  return src(
    [
      './public/css/**/*.{css,ttf,woff}',
      './public/images/**/*.{png,jpg,jpeg,gif,svg,ico}',
      './public/js/**/*.js',
      './public/vendors/**/*.{png,jpg,jpeg,gif,svg,ico,js,css,scss,eot,svg,ttf,woff}'
    ], {base: './public'}
  ).pipe(rev())
   .pipe(override())
    .pipe(revdel()) // remove original css file in public/css directory
    .pipe(dest('./public/build'))
    .pipe(rev.manifest())
    .pipe(revdelversionfile({ dest: './public/build' })) // remove old version file
    .pipe(dest('./public/build'));
  cb();
}

// restart server by gulp-nodemon
function start(cb) {
  nodemon({
      //watch: '.',
      script: 'public/imagebase.js',
      ext: 'js scss'
      //env: { 'NODE_ENV': 'development' }
  });
  cb();
}

exports.default = series(watch_task, version, start);
