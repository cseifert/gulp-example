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
	compass = require('gulp-compass'),
	localScreenshots = require('gulp-local-screenshots'),
	twig = require('gulp-twig');

gulp.task('clean', function(callback) {
	del('../dist');
	return cache.clearAll(callback);
});

gulp.task('html', function() {
	return gulp.src('source/templates/*.twig')
		.pipe(twig())
		.pipe(gulp.dest('../dist'));
});

gulp.task('compile-sass', function() {
  return gulp.src('source/scss/**/*.scss')
	.pipe(plumber())
	.pipe(sourcemaps.init())
	.pipe(compass({
		css: './source/compass/stylesheets',
		sass: './source/scss',
		image: './source/compass/images'
    }))
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

gulp.task('optimize-images', function(){
	return gulp.src('source/images/**/*.+(png|jpg|jpeg|gif|svg)')
	.pipe(cache(imagemin()))
	.pipe(gulp.dest('../dist/images'))
});

gulp.task('default', function(callback){
	runSequence('clean', ['select-icons', 'compile-iconfont', 'optimize-images', 'compile-sass', 'compile-jquery', 'compile-js', 'html', 'screens'], callback)
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
});
