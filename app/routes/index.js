module.exports = function (app, passport) {	
	app.use('/', require('./landing')(passport));
	app.use('/dashboard', require('./dashboard')());

	// API v1
	app.use('/api/v1/user', require('./api/v1/user')());
};