(function () {
  'use strict';

  var gulp = require('gulp'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    //debug = require('gulp-debug'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    browserify = require('browserify'),
    debowerify = require("debowerify"),
    nodemon = require('gulp-nodemon'),
    gutil = require('gulp-util'),
    notifier = require("node-notifier");

  /**
   * Build application (browserify and uglify)
   */
  gulp.task('buildApp', function () {
    var app = browserify('./client/main.js', {
      debug: true
    });
    app.bundle()
      .on('error', function (err) {
        gutil.log(gutil.colors.bgRed("Browserify error (App)"), gutil.colors.bgBlue(err.message));
        notifier.notify({title: "Browserify error (App)", message: err.message });
        this.emit("end");
      })
      .pipe(source('app.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(uglify())
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./client/build/'));
  });

  /**
   * Build application vendor (browserify and uglify)
   */
  gulp.task('buildAppVendor', function () {
    var vendor = browserify('./client/vendor.js', {
      debug: false
    });
    vendor.transform(debowerify);
    vendor.bundle()
      .on('error', function (err) {
        gutil.log(gutil.colors.bgRed("Browserify error (Vendor)"), gutil.colors.bgBlue(err.message));
        notifier.notify({title: "Browserify error (Vendor)", message: err.message });
        this.emit("end");
      })
      .pipe(source('vendor.js'))
      .pipe(buffer())
      .pipe(uglify())
      .pipe(gulp.dest('./client/build/'));
  });

  /**
   * Build styles for application from SASS for
   */
  gulp.task('buildSass', function () {
    gulp.src('./client/main.scss')
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(sass().on('error', function (err) {
        gutil.log(gutil.colors.bgRed("Sass compile error"), gutil.colors.bgBlue(err.message));
        notifier.notify({title: "Sass compile error", message: err.message });
        this.emit("end");
      }))
      .pipe(autoprefixer('last 2 versions'))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./client/build/'));
  });

  /**
   * Build styles for vendors from SASS
   */
  gulp.task('buildSassVendor', function () {
    gulp.src('./client/vendor.scss')
      .pipe(sass().on('error', function (err) {
        gutil.log(gutil.colors.bgRed("Sass compile error (vendor)"), gutil.colors.bgBlue(err.message));
        notifier.notify({title: "Sass compile error (vendor)", message: err.message });
        this.emit("end");
      }))
      .pipe(gulp.dest('./client/build/'));
  });

  /**
   * Watch for file changes
   */
  gulp.task('watch', function () {
    gulp.watch(['./client/main.js', './client/app/**/*.js'], ['buildApp']);
    gulp.watch('./client/vendor.js', ['buildAppVendor']);
    gulp.watch(['./client/main.scss', './client/styles/*.scss', './client/app/**/*.scss'], ['buildSass']);
    gulp.watch('./client/vendor.scss', ['buildSassVendor']);
  });

  /**
   * Start the server and watch for changes in server folder
   */
  gulp.task('startServer', function () {
    nodemon({
      script: 'server/server.js',
      ext: 'js',
      ignore: ['node_modules/**', 'client/**', 'gulpfile.js']
    });
  });

  // Default Gulp Task
  gulp.task('default', ['buildApp', 'buildAppVendor', 'buildSass', 'buildSassVendor', 'startServer', 'watch']);

}());