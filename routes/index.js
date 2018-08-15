var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {

    res.render('./index', {title: 'Express', name: "John", isAuth: req.isAuthenticated(), user: req.isAuthenticated() ? req.user : ""});
});

module.exports = router;
