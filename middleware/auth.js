const passport = require('passport')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { Strategy, ExtractJwt } = require('passport-jwt')
const User = require('../models-and-schemas/user')

// Create a strategy
const secret = process.env.JWT_SECRET
const opts = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: secret
}
const strategy = new Strategy(opts, function (jwt_payload, done) {
	User.findById(jwt_payload.id)
		.then((user) => done(null, user))
		.catch((err) => done(err))
})

// Initialize Passport
passport.use(strategy)
passport.initialize()

// Require a token to access associated routes
const requireToken = passport.authenticate('jwt', { session: false });

// Create user token on successful login
const createUserToken = (req, user) => {
	if (!user || !req.body.password || !bcrypt.compareSync(req.body.password, user.password)) {
		const err = new Error('The provided username or password is incorrect');
		err.statusCode = 422;
		throw err;
	}

	return jwt.sign({ id: user._id }, secret, { expiresIn: '24h' });
};

module.exports = {
	requireToken,
	createUserToken,
};
