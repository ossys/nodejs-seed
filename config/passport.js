var Auth			= require('./auth');
var LocalStrategy	= require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

module.exports = function(passport) {

	passport.serializeUser(function(user, done) {
		done(null, user.getId());
	});

	passport.deserializeUser(function(id, done) {
		var user = new User(id, null, function(err) {
			done(err, user);
		});
	});

	// === LOCAL SIGNUP === //
	passport.use('local-signup', new LocalStrategy({
			usernameField : 'email',
			passwordField : 'password',
			passReqToCallback : true
		},
		function(req, email, password, done) {
			process.nextTick(function() {
				User.emailExists(email, function(err, exists) {
					if (err) {
						return done(err);
					}
					if(exists) {
						return done(null, false, req.flash('error', 'That email is already taken.'));
					} else {
						stripe.customers.create({
							email: email
						}, function(err, customer) {
							if(!err) {
								var user = new User();
								user.setEmail(email);
								user.setPassword(password);
								user.setStripeId(customer.id);
								user.insert(function(err) {
									if (!err) {
										return done(null, user);
									} else {
										throw err;
									}
								});
							} else {
								throw err;
							}
						});
					}
				});
			});
		}
	));
	
	// === LOCAL LOGIN === //
	passport.use('local-login', new LocalStrategy({
		usernameField : 'email',
		passwordField : 'password',
		passReqToCallback : true
	},
	function(req, email, password, done) {
		User.getUserByEmail(email, null, function(err, user) {
			if (err) {
				return done(err);
			}

			if (!user.exists()) {
				return done(null, false, req.flash('error', 'No user found.'));
			}

			if (!user.isValidPassword(password)) {
				return done(null, false, req.flash('error', 'Oops! Wrong password.'));
			}

			return done(null, user);
		});
    }));

	
    // === FACEBOOK LOGIN === //
    passport.use(new FacebookStrategy({
        clientID        : Auth.facebook.clientID,
        clientSecret    : Auth.facebook.clientSecret,
        callbackURL     : Auth.facebook.callbackURL
    },
    // facebook will send back the token and profile
    function(token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {

            // find the user in the database based on their facebook id
//            User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
//
//                // if there is an error, stop everything and return that
//                // ie an error connecting to the database
//                if (err)
//                    return done(err);
//
//                // if the user is found, then log them in
//                if (user) {
//                    return done(null, user); // user found, return that user
//                } else {
//                    // if there is no user found with that facebook id, create them
//                    var newUser            = new User();
//
//                    // set all of the facebook information in our user model
//                    newUser.facebook.id    = profile.id; // set the users facebook id                   
//                    newUser.facebook.token = token; // we will save the token that facebook provides to the user                    
//                    newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
//                    newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
//
//                    // save our user to the database
//                    newUser.save(function(err) {
//                        if (err)
//                            throw err;
//
//                        // if successful, return the new user
//                        return done(null, newUser);
//                    });
//                }
//
//            });
        });

    }));
};