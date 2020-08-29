const router = require('express').Router();
const sequelize = require('../../config/connection');
const { Post, User, Comment } = require('../../models');
const withAuth = require('../../utils/auth');

// GET /dashboard -- redirected on successful login/signup events in public/js/login.js and requested from dashboard button in nav
router.get('/', withAuth, (req, res) => {
	Post.findAll({
		where      : {
			// use the ID from the session
			user_id : req.session.user_id
		},
		attributes : [ 'id', 'title','dimension','description','media','img_url', 'created_at' ],
		order      : [ [ 'created_at', 'DESC' ] ],
		include    : [
			{
				model      : Comment,
				attributes : [ 'id', 'comment_text', 'post_id', 'user_id', 'created_at' ],
				include    : {
					model      : User,
					attributes : [ 'username' ]
				}
			},
			{
				model      : User,
				attributes : [ 'username', 'bio', 'medium', 'interests' ]
			}
		]
	})
		.then((dbPostData) => {
			// serialize data before passing to template
      const posts = dbPostData.map((post) => post.get({ plain: true }));

      // console.log(posts);
      const userMeta = {
        username: req.session.username,
        bio: req.session.bio,
        medium: req.session.medium,
        interests: req.session.interests
      }
      
			// render template and pass through db data
			res.render('dashboard', {
        posts,
        userMeta,
        // username: req.session.username,
				loggedIn : true
			});
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json(err);
		});
});

// GET /dashboard/edit/1 -- render post form view by id
router.get('/edit/:id', withAuth, (req, res) => {
	Post.findOne({
		where      : {
			id : req.params.id
		},
		attributes :  [ 'id', 'title','dimension','description','media','img_url', 'created_at' ],
		include    : [
			{
				model      : Comment,
				attributes : [ 'id', 'comment_text', 'post_id', 'user_id', 'created_at' ],
				include    : {
					model      : User,
					attributes : [ 'username' ]
				}
			},
			{
				model      : User,
				attributes : [ 'username' ]
			}
		]
	})
		.then((dbPostData) => {
			if (!dbPostData) {
				res.status(404).json({ message: 'No post found with this id' });
				return;
			}

			// serialize the data
			const post = dbPostData.get({ plain: true });

			// pass data to template
			res.render('edit-post', {
				post,
				loggedIn : true
			});
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json(err);
		});
});

// GET /dashboard/new
router.get('/new', withAuth, (req, res) => {
	res.render('add-post', {
    loggedIn : true
  });
});

// GET /dashboard/edit/1
router.get('/edit/:id', withAuth, (req, res) => {
	Post.findOne({
		where      : {
			id : req.params.id
		},
		attributes : [ 'id', 'title','upload_img','dimension','description','media','created_at' ],
		include    : [
			{
				model      : Comment,
				attributes : [ 'id', 'comment_text', 'post_id', 'user_id', 'created_at' ],
				include    : {
					model      : User,
					attributes : [ 'username' ]
				}
			},
			{
				model      : User,
				attributes : [ 'username' ]
			}
		]
	})
		.then((dbPostData) => {
			if (!dbPostData) {
				res.status(404).json({ message: 'No post found with this id' });
				return;
			}

			// serialize the data
			const post = dbPostData.get({ plain: true });

			// pass data to template
			res.render('edit-post', {
				post,
				loggedIn : true
			});
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json(err);
		});
}); 

module.exports = router;

