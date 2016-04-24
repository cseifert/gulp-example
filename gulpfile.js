require('es6-promise').polyfill();

var gulp = require('gulp'),
	sass = require('gulp-sass'),
	sassGlobbing = require('gulp-css-globbing'),
	nano = require('gulp-cssnano'),
	buffer = require('vinyl-buffer'),
	sourcemaps = require('gulp-sourcemaps'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	del = require('del'),
	imagemin = require('gulp-imagemin'),
	cache = require('gulp-cache'),
	rename = require('gulp-rename'),
	plumber = require('gulp-plumber'),
	fontcustom = require('gulp-fontcustom'),
	runSequence = require('run-sequence'),
	jquery = require('gulp-jquery'),
	localScreenshots = require('gulp-local-screenshots'),
	twig = require('gulp-twig'),
	spritesmith = require('gulp.spritesmith'),
	merge = require('merge-stream'),
	autoprefixer = require('gulp-autoprefixer'),
	scsslint = require('gulp-scss-lint'),
	jshint = require('gulp-jshint'),
	jscs = require('gulp-jscs'),
	stylish = require('jshint-stylish'),
	html5Lint = require('gulp-html5-lint'),
	sassBeautify = require('gulp-sassbeautify'),
	jsBeautify = require('gulp-js-prettify'),
	otf2ttf = require('otf2ttf'),
	ttf2woff = require('gulp-ttf2woff'),
	ttf2eot = require('gulp-ttf2eot'),
	fontAwesomeGenerator = require('font-awesome-svg-png/lib/generate');

gulp.task('clean', function(callback) {
	del('../dist');
	return cache.clearAll(callback);
});

gulp.task('html', function() {
	return gulp.src('source/templates/*.twig')
		.pipe(plumber())
		.pipe(twig())
		.pipe(html5Lint())
		.pipe(plumber.stop())
		.pipe(gulp.dest('../dist'));
});

gulp.task('compile-sass', function() {
	return gulp.src(['source/scss/**/*.scss', '!source/scss/vendor/**/*.scss'])
		.pipe(plumber())
		.pipe(scsslint({
			bundleExec: false,
			config: 'scss-lint.yml'
		}))
		.pipe(sourcemaps.init())
		.pipe(sassGlobbing({
			extensions: ['.scss']
	    }))
		.pipe(sass({
			includePaths: [
               require('node-reset-scss').includePath,
               'node_modules/bootstrap-sass/assets/stylesheets/'
            ]
	    }))
		.pipe(autoprefixer('last 2 version', 'safari 5', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
		.pipe(gulp.dest('../dist/css'))
		.pipe(nano())
		.pipe(rename({suffix:'.min'}))
		.pipe(sourcemaps.write('sourcemaps'))
		.pipe(plumber.stop())
		.pipe(gulp.dest('../dist/css'))
});

gulp.task('beautify-sass', function () {
  return gulp.src('source/scss/*.scss')
    .pipe(sassBeautify())
    .pipe(gulp.dest('source/scss/'));
});

gulp.task('compile-jquery', function() {
	return jquery.src({
			release: 2,
			flags: ['-deprecated']
		})
		.pipe(gulp.dest('source/js/vendor'));
});

gulp.task('compile-js', function(){
	gulp.src(['source/js/**/*.js', '!source/js/vendor/**/*.js'])
		.pipe(jshint('.jshintrc'))
		.pipe(jshint.reporter(stylish))
		.pipe(jscs())
		.pipe(jscs.reporter());

	return gulp.src([
			"source/js/vendor/*.js",
			"node_modules/bootstrap-sass/assets/javascripts/bootstrap.min.js",
			"node_modules/magnific-popup/dist/jquery.magnific-popup.min.js",
			"source/js/*.js"
		])
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(concat('active-content.js'))
		.pipe(gulp.dest('../dist/js'))
		.pipe(uglify())
		.pipe(rename({suffix:'.min'}))
		.pipe(sourcemaps.write('sourcemaps'))
		.pipe(plumber.stop())
		.pipe(gulp.dest('../dist/js'))
});

gulp.task('beautify-js', function() {
	gulp.src(['source/js/**/*.js', '!source/js/vendor/*.js'])
		.pipe(jsBeautify({collapseWhitespace: true}))
		.pipe(jscs({fix:true}))
		.pipe(gulp.dest('source/js'));
});

gulp.task('otf2ttf', function () {
	return gulp.src('source/fonts/**/*.otf')
		.pipe(otf2ttf())
		.pipe(gulp.dest(function(file) {
			return 'source/fonts/' + file.data.fontName
		}));
});

gulp.task('ttf2eot', function() {
	return gulp.src('source/fonts/**/*.ttf')
		.pipe(ttf2eot())
		.pipe(gulp.dest('source/fonts/'));
});

gulp.task('ttf2woff', function() {
	return gulp.src('source/fonts/**/*.ttf')
		.pipe(ttf2woff())
		.pipe(gulp.dest('source/fonts/'));
});

gulp.task('extract-icons', function() {
	return fontAwesomeGenerator({
		'dest': 'source/iconfont/font-awesome/',
		'color': 'black',
		'size': '64',
		'svg': true,
		'png': false
	});
});

gulp.task('compile-iconfont', function(){
	return gulp.src('source/iconfont/icons/*.svg')
		.pipe(plumber())
		.pipe(fontcustom({
			font_name: 'webfont',
			'css-selector': '.icon-{{glyph}}',
			'preprocessor-path': '../iconfont/',
			templates: 'scss'
		}))
		.pipe(plumber.stop())
		.pipe(gulp.dest('source/iconfont'))
		.pipe(gulp.dest('../dist/iconfont'))
		.on('end', function() {
			return gulp.src('source/iconfont/*.scss')
				.pipe(gulp.dest('source/scss/vendor'))
		});
});

gulp.task('compile-sprites', function () {
	var spriteData = gulp.src('source/images/sprites/*.png')
		.pipe(spritesmith({
			retinaSrcFilter: 'source/images/sprites/*-2x.png',
			imgName: 'sprites.png',
			retinaImgName: 'sprites-2x.png',
			cssName: '_sprites.scss',
			imgPath: '../images/sprites/sprites.png',
			retinaImgPath: '../images/sprites/sprites-2x.png'
		}));

	var imgStream = spriteData.img
		.pipe(buffer())
		.pipe(imagemin())
		.pipe(gulp.dest('../dist/images/sprites'));

	var cssStream = spriteData.css
		.pipe(gulp.dest('source/scss/vendor'));

	return merge(imgStream, cssStream);
});

gulp.task('optimize-images', function(){
	return gulp.src('source/images/**/*.+(png|jpg|jpeg|gif|svg)')
		.pipe(cache(imagemin()))
		.pipe(gulp.dest('../dist/images'))
});

gulp.task('screens', function () {
	return gulp.src('../dist/*.html')
		.pipe(localScreenshots({
			path: '../dist/',
			width: ['1600', '1000', '480', '320'],
			folder: '../dist/screens'
		}));
});

gulp.task('default', function(callback){
	runSequence('clean', 'compile-iconfont', 'compile-sprites', 'optimize-images', 'compile-sass', 'compile-jquery', 'compile-js', 'html', 'screens', callback)
});

gulp.task('watch', function(){
	gulp.watch('source/templates/**/*.twig', ['html']);
	gulp.watch('source/scss/**/*.scss', ['compile-sass']);
	gulp.watch('source/js/**/*.js', ['compile-js']);
	gulp.watch('source/iconfont/icons/*.*', ['compile-iconfont']);
	gulp.watch('source/images/sprites/*.png', ['compile-sprites']);
});
