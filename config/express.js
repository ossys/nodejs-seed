var express			= require('express');
var glob			= require('glob');
var favicon			= require('serve-favicon');
var logger			= require('morgan');
var cookieParser	= require('cookie-parser');
var bodyParser		= require('body-parser');
var compress		= require('compression');
var methodOverride	= require('method-override');
var session			= require('express-session');
var flash			= require('connect-flash');
var passport		= require('passport');
var MongoStore		= require('connect-mongo')(session);
var mongoose		= require('mongoose');

module.exports = function(app, config) {
	app.set('views', config.root + '/app/views');
	app.set('view engine', 'jade');

	var env = process.env.NODE_ENV || 'development';
	app.locals.ENV = env;
	app.locals.ENV_DEVELOPMENT = env == 'development';

	// app.use(favicon(config.root + '/public/img/favicon.ico'));
	app.use(logger('dev'));
	app.use(cookieParser());
	app.use(compress());
	app.use(express.static(config.root + '/public'));
	app.use(methodOverride());
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({
		extended: true
	}));
  
	// https://codeforgeek.com/2014/09/manage-session-using-node-js-express-4/
	app.use(session({
	    cookie: { maxAge: 3600000 },
	    store: new MongoStore({
	    	mongooseConnection : mongoose.connection
	    }),
	    saveUninitialized: true,
	    resave: 'true',
	    secret: 'secret'
	}));

	// Controllers
	var controllers = glob.sync(config.root + '/app/controllers/*.js');
	controllers.forEach(function (controller) {
		require(controller)(app);
	});
	
	// https://gist.github.com/brianmacarthur/a4e3e0093d368aa8e423
	app.use(flash());
	
	// http://code.tutsplus.com/tutorials/authenticating-nodejs-applications-with-passport--cms-21619
	// https://scotch.io/tutorials/easy-node-authentication-setup-and-local
	require('./passport')(passport);
	app.use(passport.initialize());
	app.use(passport.session());

	// Main router
	require(config.root + '/app/routes')(app, passport);

	app.use(function (req, res, next) {
		var err = new Error('Not Found');
		err.status = 404;
		next(err);
	});
  
	if(app.get('env') === 'development'){
		app.use(function (err, req, res, next) {
			res.status(err.status || 500);
			console.error(err);
			res.render('error', {
				message: err.message,
				error: err,
				title: 'error'
			});
		});
	}

	app.use(function (err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: {},
			title: 'error'
		});
	});

};
