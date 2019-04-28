var express = require('express');
var crypto = require('crypto');
var router = express.Router();
var sql = require('../DB/db_SQL')();

router.get('/admin', function(req, res, next) {
    res.render('index_admin.html');
});



module.exports = router;