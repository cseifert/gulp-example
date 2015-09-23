require('es6-promise').polyfill();

var gulp = require('gulp'),
	sass = require('gulp-sass'),
	minifyCss = require('gulp-minify-css'),
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
	csso = require('gulp-csso'),
	spritesmith = require('gulp.spritesmith'),
	merge = require('merge-stream'),
	autoprefixer = require('gulp-autoprefixer'),
	scsslint = require('gulp-scss-lint'),
	jshint = require('gulp-jshint'),
	stylish = require('jshint-stylish'),
	html5Lint = require('gulp-html5-lint');

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
	return gulp.src('source/scss/**/*.scss')
		/*.pipe(scsslint({
			bundleExec: false
		}))
		*/
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(sass())
		.pipe(autoprefixer('last 2 version', 'safari 5', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
		.pipe(csso())
		.pipe(gulp.dest('../dist/css'))
		.pipe(minifyCss())
		.pipe(rename({suffix:'.min'}))
		.pipe(sourcemaps.write('sourcemaps'))
		.pipe(plumber.stop())
		.pipe(gulp.dest('../dist/css'))
});

gulp.task('compile-jquery', function() {
	return jquery.src({
		release: 2,
		flags: ['-deprecated']
		})
		.pipe(gulp.dest('source/js/vendor'));
});

gulp.task('compile-js', function(){
	return gulp.src([
			'source/js/vendor/jquery.custom.js',
			'bower_components/bootstrap-sass/assets/javascripts/bootstrap.min.js',
			'bower_components/magnific-popup/dist/jquery.magnific-popup.min.js',
			'source/js/app.js'
		])
		.pipe(plumber())
		.pipe(jshint())
		.pipe(jshint.reporter(stylish))
		.pipe(sourcemaps.init())
		.pipe(concat('active-content.js'))
		.pipe(gulp.dest('../dist/js'))
		.pipe(uglify())
		.pipe(rename({suffix:'.min'}))
		.pipe(sourcemaps.write('sourcemaps'))
		.pipe(plumber.stop())
		.pipe(gulp.dest('../dist/js'))
});

gulp.task('select-icons', function() {
	return gulp.src('bower_components/Font-Awesome-SVG-PNG/white/svg/*.svg')
		.pipe(gulp.dest('source/iconfont/icons'));
});

gulp.task('compile-iconfont', function(){
	return gulp.src('source/iconfont/icons/*.svg')
		.pipe(plumber())
		.pipe(fontcustom({
			font_name: 'myfont',
			'css-selector': '.icon-{{glyph}}',
			'preprocessor-path': '../iconfont/',
			templates: 'scss'
		}))
		.pipe(plumber.stop())
		.pipe(gulp.dest('source/iconfont'))
		.pipe(gulp.dest('../dist/iconfont'))
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
		.pipe(imagemin())
		.pipe(gulp.dest('../dist/images/sprites'));

	var cssStream = spriteData.css
		.pipe(gulp.dest('source/scss'));

	return merge(imgStream, cssStream);
});

gulp.task('optimize-images', function(){
	return gulp.src('source/images/**/*.+(png|jpg|jpeg|gif|svg)')
		.pipe(cache(imagemin()))
		.pipe(gulp.dest('../dist/images'))
});

gulp.task('default', function(callback){
	runSequence('clean', ['select-icons', 'compile-iconfont', 'compile-sprites', 'optimize-images', 'compile-sass', 'compile-jquery', 'compile-js', 'html', 'screens'], callback)
});

gulp.task('screens', function () {
	return gulp.src('../dist/*.html')
		.pipe(localScreenshots({
			path: '../dist/',
			width: ['1600', '1000', '480', '320'],
			folder: '../dist/screens'
		}));
});

gulp.task('watch', function(){
	gulp.watch('source/templates/**/*.twig', ['html']);
	gulp.watch('source/scss/**/*.scss', ['compile-sass']);
	gulp.watch('source/js/**/*.js', ['compile-js']);
	gulp.watch('source/iconfont/icons/*.*', ['compile-iconfont']);
	gulp.watch('source/images/sprites/*.png', ['compile-sprites']);
});
