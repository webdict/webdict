const source = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');
const browserify = require('browserify');
const replace = require('gulp-replace');
const buffer = require('vinyl-buffer');
const uglify = require('gulp-uglify');
const minimist = require('minimist');
const logger = require('gulplog');
const tsify = require('tsify');
const gulp = require('gulp');
const path = require('path');
const fs = require('fs');



const knownOptions = {
  string: ['url'],
  default: { url: 'cloud' }
};

const options = minimist(process.argv.slice(0), knownOptions);

function ofUrl(value) {
  switch (value) {
    case 'local':
      logger.info('Using local url...');
      return 'http://127.0.0.1:5000';
    case 'cloud':
      logger.info('Using cloud url...');
      return 'http://120.78.146.219';
    default:
      logger.info(`Using ${options[key]}...`);
      return options[key];
  }
}


function of(key) {
  switch (key) {
    case 'url':
      return ofUrl(options[key]);
    default:
      throw `'${key}' not defined`;
  }
}

const main = 'main.ts';
const index = 'index.ts';
const src = './src';
const version = '1';

const dirs = fs.readdirSync(src).filter(
  (dir) => fs.statSync(path.join(src, dir)).isDirectory() && (fs.existsSync(path.join(src, dir, main)) || fs.existsSync(path.join(src, dir, index)))
);

dirs.forEach((dir) => {
  const b = fs.existsSync(path.join(src, dir, main));
  const f = b ? main : index;
  const t = b ? 'dist' : 'docs';
  gulp.task(dir, () => {
    return browserify({
        basedir: '.',
        debug: false,
        entries: [path.join(src, dir, f)],
        cache: {},
        packageCache: {}
      })
      .plugin(tsify)
      .transform('babelify', {
        presets: ['es2015'],
        extensions: ['.ts']
      })
      .bundle()
      .pipe(source(dir + '.js'))
      .pipe(buffer())
      // .pipe(sourcemaps.init({loadMaps: true}))
      // .pipe(uglify())
      // .pipe(sourcemaps.write('./'))
      .pipe(replace('__DOMAIN_HOLDER__', of('url')))
      .pipe(replace('__VERSION_HOLDER__', version))
      .pipe(gulp.dest(t));
  });
});



gulp.task('default', dirs);

