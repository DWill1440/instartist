const router = require('express').Router();
const { User, Post, Comment } = require('../../models');
const withAuth = require('../../utils/auth');

// GET /api/users
router.get('/', (req, res) => {
	User.findAll({
		attributes : { exclude: [ 'password' ] }
	})
		.then((dbUserData) => res.json(dbUserData))
		.catch((err) => {
			console.log(err);
			res.status(500).json(err);
		});
});

// GET /api/users/1
router.get('/:id', (req, res) => {
	User.findOne({
		attributes : { exclude: [ 'password' ] },
		where      : {
			id : req.params.id
		},
		include    : [
			{
				model      : Post,
				attributes : [ 'id', 'title','dimension','description','media','img_url', 'created_at' ],
			},
			{
				model      : Comment,
				attributes : [ 'id', 'comment_text', 'created_at' ],
				include    : {
					model      : Post,
					attributes : [ 'title' ]
				}
			}
		]
	})
		.then((dbUserData) => {
			if (!dbUserData) {
				res.status(404).json({ message: 'No user found with this id' });
				return;
			}
			res.json(dbUserData);
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json(err);
		});
});

// POST /api/users -- create user on signup
router.post('/', (req, res) => {
	User.create({
		username : req.body.username,	
    email: req.body.email,
    password : req.body.password,
    bio: req.body.bio,
    medium: req.body.medium,
    interests: req.body.interests
	}).then((dbUserData) => {
		req.session.save(() => {
			req.session.user_id = dbUserData.id;
			req.session.username = dbUserData.username;
			req.session.bio = dbUserData.bio;
			req.session.medium = dbUserData.medium;
			req.session.interests = dbUserData.interests;
      req.session.loggedIn = true;
      
      req.flash('success', `Hi ${req.session.username}, welcome to Instartist!`);
			res.json(dbUserData);
		});
	});
});

// PUT /api/users/1
router.put('/:id', withAuth, (req, res) => {	
	User.update(req.body, {
		individualHooks : false,
		where           : {
			id : req.params.id
		}
	})
		.then((dbUserData) => {
			if (!dbUserData[0]) {
				res.status(404).json({ message: 'No user found with this id' });
				return;
			}
			res.json(dbUserData);
			
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json(err);
		});
});

// DELETE /api/users/1
router.delete('/:id', withAuth, (req, res) => {
	Post.destroy({   //delete post when delete a user
		where:{
			user_id:req.params.id
		}
		
	})
	Comment.destroy({
		where : {
			user_id : req.params.id
		}
	}).then(() => {
		User.destroy({
			where : {
				id : req.params.id
			}
		})
			.then((dbUserData) => {
				if (!dbUserData) {
					res.status(404).json({ message: 'No user found with this id' });
					return;
				}
				res.json(dbUserData);
			})
			.catch((err) => {
				console.log(err);
				res.status(500).json(err);
			});
	});
});

// POST /api/users/login -- login
router.post('/login', (req, res) => {
	// find user based on username
	User.findOne({
		where : {
			username : req.body.username
		}
	}).then((dbUserData) => {
		if (!dbUserData) {
			res.status(400).json({ message: 'No user with that username!' });
			return;
		}

		// validate password
		const validPassword = dbUserData.checkPassword(req.body.password);

		if (!validPassword) {
      req.flash('error', 'Incorrect credentials')
      res.redirect('/login');
			res.status(400).json({ message: 'Incorrect password!' });
			return;
		}

		// initiate creation of session and grab values for session variables from db
		req.session.save(() => {
			// declare session variables
      req.session.user_id = dbUserData.id;
			req.session.username = dbUserData.username;
			req.session.bio = dbUserData.bio;
			req.session.medium = dbUserData.medium;
			req.session.interests = dbUserData.interests;
			req.session.loggedIn = true;

      req.flash('success', 'You are now logged in!');
			res.json({ user: dbUserData, message: 'You are now logged in!' });
		});
	});
});

// POST /api/users/logout
// logout -- if user is loggedIn, destroy session variables and reset cookie to clear session, then send res back to client so it can redirect user to homepage
router.post('/logout', (req, res) => {

	if (req.session.loggedIn) {
    // DOESN'T WORK BECAUSE SESSION GETS DESTROYED.  IS THERE ANOTHER WAY TO LOG OUT USER WITHOUT DESTROYING SESSION?
    // req.flash('success', 'You have logged out!');
    req.flash('success', 'You have logged out!');
		req.session.destroy(() => {
			res.status(204).end();
		});
	} else {
		res.status(404).end();
	}
});

module.exports = router;
