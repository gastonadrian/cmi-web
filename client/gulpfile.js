let gulp = require('gulp'),
    $ = require('gulp-load-plugins')(),
    runSequence = require('run-sequence'),
    pug = require('pug-plugin-ng'),
    del = require('del'),
    exec = require('child_process').exec,
    pugOptions = { doctype: 'html', plugins: [pug], pretty: true },
    toSrc = gulp.dest((file) => file.base);

const tscConfig = require('./tsconfig.json');

$.paths ={
  js: ['app/**/*.ts']
};


// clean the contents of the distribution directory
gulp.task('clean', function () {
  return del('dist/**/*');
});

gulp.task('less', function(){

    var src = [
        './styles/*.less',
    ];

    return gulp.src(src)
        .pipe($.less({}))
        .pipe(gulp.dest('./dist/styles'));
});

// gulp.task('js', function(){
//     gulp.src(['./src/**/*.js','./src/*.js'])
//         .pipe(gulp.dest('./dist/js'));
// });

function runCommand(command){
  return function(cb){
    exec(command, function (err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      cb(err);
    });
  }
}

gulp.task('compile-angular2',
  runCommand('node_modules/.bin/ngc -p tsconfig.json')
);

gulp.task('bundle-angular2', ['compile-angular2'], runCommand('node_modules/.bin/rollup -c rollup-config.js'));

gulp.task('build', ['default','bundle-angular2'], function(){
  return del(['app/**/*.js','app/**/*.js.map','aot/','!app/adminLTE.js']);
});

gulp.task('pug', () =>
  gulp.src('src/**/*.pug')
    .pipe($.pug(pugOptions))
    .pipe(toSrc)
);

gulp.task('watch', [], () => {
  runSequence(
    ['pug'],
    () => {
      gulp.watch('src/**/*.pug', () => gulp.start('pug'));
    }
  );
});


gulp.task('img', function(){
    gulp.src('./img/**')
        .pipe(gulp.dest('./dist/img'));
});

gulp.task('favicon', function(){
  gulp.src('./favicon.ico')
    .pipe(gulp.dest('./dist'));
});

gulp.task('default', ['less','img','favicon']);