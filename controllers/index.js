const router = require('express').Router();

// brings in api/index.js
const apiRoutes = require('./apiRoutes');
const homeRoutes = require('./homeRoutes');


// prefixes routes in api/index.js with /api
router.use('/api', apiRoutes);
router.use('/', homeRoutes);


router.use((req, res) => {
	res.status(404).end();
});

module.exports = router;
