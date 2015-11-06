var express = require('express');
var router = express.Router();

module.exports = function(passport) {

/**
*	/dashboard
**/
router.route('/')
	.get(function (req, res, next) {
		if(req.isAuthenticated()) {
			res.render('dashboard', {
				title: 'NodeJS Seed Project'
			});
		} else {
			res.redirect('/login');
		}
	});

return router;
}