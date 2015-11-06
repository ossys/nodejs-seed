var express = require('express');
var router = express.Router();
var InstallerController = require('../controllers/InstallerController');

module.exports = function(passport) {

/**
 *	/
 */
router.route('/')
	.get(function (req, resp, next) {
		resp.render('landing', {
			title: 'NodeJS Seed Project'
		});
	});


/**
 *	/signup
 */
router.route('/signup')
	.get(function (req, resp, next) {
		resp.render('signup', {
			title: 'NodeJS Seed Project'
		});
	})
	.post(passport.authenticate('local-signup', {
		successRedirect : '/dashboard/#/',
		failureRedirect : '/signup',
        failureFlash: true
	}));


/**
 *	/login
 */
router.route('/login')
	.get(function (req, resp, next) {
		resp.render('login', {
			title: 'NodeJS Seed Project'
		});
	})
	.post(passport.authenticate('local-login', {
        successRedirect : '/dashboard/#/',
        failureRedirect : '/login',
        failureFlash : true
    }));


/**
 *	/logout
 */
router.route('/logout')
	.get(function (req, resp, next) {
		req.logout();
		resp.redirect('/login');
	});


/**
 *	/install
 */
router.route('/install')
	.get(function (req, resp, next) {
		InstallerController.install(null);
		
		resp.render('install', {
			title: 'NodeJS Seed Project'
		});
	});


	return router;
}