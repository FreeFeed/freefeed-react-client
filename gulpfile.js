// gulpfile.js

var gulp = require('gulp');

var babelify = require('babelify');
var browserify = require('browserify');
var browserSync = require('browser-sync').create();
var source = require('vinyl-source-stream');
var historyApiFallback = require('connect-history-api-fallback');

gulp.task('build', function () {
  browserify({
    entries: 'src/index.jsx',
    extensions: ['.jsx'],
    debug: true
  })
    .transform(babelify.configure({
      optional: ["runtime", "es7.asyncFunctions"]
    }))
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('public/js'));
});

gulp.task("watch", function(){
  gulp.watch('src/*.jsx', ['build'])
});

gulp.task('serve', ['build'], function() {
  browserSync.init({
    server: {
      baseDir: "./public",
      middleware: [ historyApiFallback() ]
    },
    port: 3333
  });

  gulp.watch('src/**/*.jsx', ['build'])
  gulp.watch("public/js/bundle.js").on('change', browserSync.reload);
});

gulp.task('default', ['build']);
