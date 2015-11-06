var express = require('express');
var router = express.Router();

module.exports = function() {
	
/**
 *	/api/v1/user
 */
router.route('/')
	.get(function (req, resp, next) {
		if(req.isAuthenticated()) {
			var id = req.user.getId();
		} else {
			resp.json(401, {success:false, msg:'Not Authorized'});
		}
	});


	return router;
}