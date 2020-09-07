// custom middleware to verify user logged in before restricted route access given (authguard)
const withAuth = (req, res, next) => {
	if (!req.session.user_id) {
		req.flash('error', 'Please sign up or login first!');
		res.redirect('/login');
	} else {
		next();
	}
};

module.exports = withAuth;
