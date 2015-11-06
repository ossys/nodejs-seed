var
  pkg =			require('./package.json'),
  async =		require('async'),
  beep =		require('beepbeep');
  browserify =	require('browserify'),
  del =			require('del'),
  gulp =		require('gulp'),
  coffeelint =	require('gulp-coffeelint'),
  concat =		require('gulp-concat'),
  html2js =		require('gulp-html2js'),
  insert =		require('gulp-insert'),
  jade =		require('gulp-jade'),
  livereload =	require('gulp-livereload'),
  minifyCss =	require('gulp-minify-css'),
  nodemon =		require('gulp-nodemon'),
  rename =		require('gulp-rename'),
  sass =		require('gulp-sass'),
  streamify =	require('gulp-streamify'),
  uglify =		require('gulp-uglify'),
  gutil =		require('gulp-util'),
  path =		require('path'),
  source =		require('vinyl-source-stream');

var products = {
  resources: {
	resources: {
	  './res/{img,sfx}/**': './public/',
	  './bower_components/simple-line-icons/fonts/Simple-Line-Icons.ttf': './public/fonts/',
	  './bower_components/font-awesome/fonts/fontawesome-webfont.ttf': './public/fonts/',
	  './bower_components/font-awesome/fonts/fontawesome-webfont.svg': './public/fonts/',
	  './bower_components/font-awesome/fonts/fontawesome-webfont.woff': './public/fonts/',
	  './bower_components/font-awesome/fonts/fontawesome-webfont.woff2': './public/fonts/',
	  './bower_components/fancybox/source/*.{png,gif} ': './public/css/'
	},
	templates: {
		'./app/coffee/components/**/templates/*.jade': './public/js/'
	}
  },
  landing: {
	scss: {
		'./app/sass/landing.scss': './public/css/landing.css'
	},
	coffee: {
		'./app/coffee/landing.coffee': './public/js/landing.js'
	},
	deps: {
		"angular": "./bower_components/angular/angular.js",
		"bootstrap": "./bower_components/bootstrap/dist/js/bootstrap.js",
		"jquery.fancybox": "./bower_components/fancybox/source/jquery.fancybox.js"
	}
  },
  dashboard: {
	scss: {
		'./app/sass/dashboard.scss': './public/css/dashboard.css'
	},
	coffee: {
		'./app/coffee/dashboard.coffee': './public/js/dashboard.js'
	},
	deps: {
		"angular": "./bower_components/angular/angular.js",
		"angular-ui-router": "./bower_components/angular-ui-router/release/angular-ui-router.js",
		"angular-bootstrap": "./bower_components/angular-bootstrap/ui-bootstrap.js",
		"angular-bootstrap-tpls": "./bower_components/angular-bootstrap/ui-bootstrap-tpls.js",
		"angular-ui": "./bower_components/angular-ui/build/angular-ui.min.js",
		"bootstrap": "./bower_components/bootstrap/dist/js/bootstrap.js"
	}
  }
};

var browserify_helper = function (res, cb) {
	var b = browserify({debug: true})
		.transform('coffeeify')
		.add(res[0]);

		for(key in products[res[2]]['deps']) {
			if(key !== '__product__') {
				b.external(key);
			}
		}

	var stream = b.bundle()
		.on('error', function(e) {
			beep();
			gutil.log('\n\n')
			gutil.log('==================================='.red);
			gutil.log('Coffeescript Error'.underline.red);
			gutil.log(e.toString());
			gutil.log('===================================\n\n'.red);
			this.emit('end');
		})
		.pipe(source(path.basename(res[1])))
		.pipe(gulp.dest(path.dirname(res[1])))
		.pipe(streamify(uglify()))
		.pipe(rename({extname: '.min.js'}))
		.pipe(gulp.dest(path.dirname(res[1])));

	if (cb) {
		stream.on('end', cb);
	} else {
		return stream;
	}
};

var deps_helper = function (res, cb) {
	var b = browserify()
	.transform('browserify-shim');

	for(key in res) {
		if(key !== '__product__' && key !== 'angular-mocks') {
			b.require(res[key], {expose: key});
		}
	}

	var stream = b.bundle()
		.pipe(source(res['__product__'] + '.deps.js'))
		.pipe(gulp.dest('./public/js/'));
//		.pipe(streamify(uglify()))
//		.pipe(rename(res['__product__'] + '.deps.min.js'))
//		.pipe(gulp.dest('./public/js/'));

	if (cb) {
		stream.on('end', cb);
	} else {
		return stream;
	}
};

var get_product = function (product, fn) {
	var array = new Array();
	for(k in products) {
		for(key in products[k]) {
			if(product === 'deps' && key === 'deps') {
				products[k][key]['__product__'] = k;
				array.push(products[k][key]);
			} else if(key === product) {
				for(f in products[k][key]) {
					var tmp = new Array();
					tmp.push(f);
					tmp.push(products[k][key][f]);
					tmp.push(k);
					array.push(tmp);
				}
			}
		}
	}
	return array.map(fn);
};

gulp.task('clean', function (cb) {
	del(['./public/*'], cb);
});

//Generates both full and minified css files.  Source comments get stripped from minified.
gulp.task('sass', function (cb) {
	async.parallel(get_product('scss', function (scss) {
		return function(done) {
			gulp.src(scss[0])
			.pipe(sass({sourceComments: 'map'}))
			.pipe(rename(path.basename(scss[1])))
			.pipe(gulp.dest(path.dirname(scss[1])))
			.pipe(minifyCss())
			.pipe(rename({extname: '.min.css'}))
			.pipe(gulp.dest(path.dirname(scss[1])))
			.on('end', done);
		}
	}), cb);
});

//TODO: separate build artifacts, templates.js is only an intermediate...
gulp.task('templates', function (cb) {
	async.parallel(get_product('templates', function (tpl) {
		return function (done) {
			gulp.src([tpl[0]])
			.pipe(jade({
				locals: {}
			}))
			.on('error', function(e) {
				beep();
				gutil.log('\n\n')
				gutil.log('==================================='.red);
				gutil.log('Jade Error'.underline.red);
				gutil.log(e.toString());
				gutil.log('===================================\n\n'.red);
			})
			.pipe(html2js({
				outputModuleName: 'nodejs.templates',
				base: './public/js/',
				// This rename function is for angular-foundation templates
				rename : function (modulePath) {
					var moduleName = modulePath.replace('../../app/coffee/components/', '');
					return moduleName;
				}
			}))
			.pipe(concat('templates.js'))
			.pipe(insert.prepend("var angular = require('angular');"))
			.pipe(gulp.dest(tpl[1]))
			.on('end', done);
		};
	}), cb);
});

gulp.task('coffeeify', ['templates'], function (cb) {
	async.parallel(get_product('coffee', function (res) {
		return function (done) {
			browserify_helper(res, done);
		}
	}), function () {
		del('./public/js/templates.js', cb);
	});
});

gulp.task('deps', function (cb) {
	async.parallel(get_product('deps', function (res) {
		return function (done) {
			deps_helper(res, done);
		}
	}), cb);
});

gulp.task('resources', function (cb) {
	var streams = get_product('resources', function (res) {
		return function (done) {
			gulp.src(res[0])
			.pipe(gulp.dest(res[1]))
			.on('end', done);
		}
	});
	async.parallel(streams, cb);
});

gulp.task('watch', function () {
	gulp.watch('./app/sass/**/*.{scss,sass}', ['sass']);
	gulp.watch('./app/coffee/components/**/templates/*.jade', ['templates', 'coffeeify']);
	gulp.watch('./app/coffee/**/*.coffee', ['coffeelint', 'coffeeify']);
	gulp.watch('./res/{font,html,img,sfx}/**', ['resources']);
});

gulp.task('develop', ['sass', 'templates', 'coffeeify', 'deps', 'resources'], function () {
	livereload.listen();
	nodemon({
		script: 'app.js',
		ext: 'js coffee jade',
	}).on('restart', function() {
		setTimeout(function () {
			livereload.changed(__dirname);
		}, 500);
	});
});

gulp.task('coffeelint', function (cb) {
	return gulp.src('./app/coffee/**/*.coffee')
		.pipe(coffeelint())
		.pipe(coffeelint.reporter());
});

gulp.task('default', ['build', 'develop', 'watch']);
gulp.task('scss', ['sass']);
gulp.task('build', ['sass', 'templates', 'coffeeify', 'deps', 'resources']);
