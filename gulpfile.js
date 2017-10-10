let gulp = require('gulp');
let clean = require('gulp-clean');
let merge = require('merge2');
let typescript = require('gulp-typescript');
let tslint = require('gulp-tslint');
let sourcemaps = require('gulp-sourcemaps');
let copy = require('gulp-copy');
let mocha = require('gulp-spawn-mocha');
let apidoc = require('gulp-apidoc');

let tsProject = typescript.createProject('tsconfig.json', {
    declaration: true
});

gulp.task('clean', () => {
    return merge([
        gulp.src('release/definitions/*', { read: false }).pipe(clean()),
        gulp.src('release/js/bin/*', { read: false }).pipe(clean())
    ]);
});

gulp.task('build', ['clean'], function() {
    let tsResult = tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(tslint({ configuration: 'tslint.json' }))
        .pipe(tslint.report({ emitError: true }))
        .pipe(tsProject());

    return merge([
        tsResult.js
            .pipe(sourcemaps.mapSources(function(sourcePath, file) {
                return '../../../src/' + sourcePath;
            }))
            .pipe(sourcemaps.write('.', {
                includeContent: false
            }))
            .pipe(gulp.dest('release/js')),
        tsResult.dts.pipe(gulp.dest('release/definitions')),
        gulp.src('src/**/*.js').pipe(copy('release/js', { prefix: 1 }))
    ]);
});

gulp.task('test', function() {
    return gulp
        .src(['release/js/**/*.test.js'])
        .pipe(mocha({
            env: {
                NODE_ENV: 'test',
                PC_SILENT: true
            },
            timeout: 3000
        }));
});

gulp.task('docs', function(done) {
    apidoc({
        src: 'src/',
        dest: 'docs/api/',
        config: './'
    }, done);
});

gulp.task('default', ['build']);