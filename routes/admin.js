var express = require('express');
var crypto = require('crypto');
var router = express.Router();
var sql = require('../DB/db_SQL')();

router.get('/admin', function(req, res, next) {
    res.render('index_admin.html');
});

router.get('/admin/main', function(req, res, next) {

    var query = `select * from account`;
    var param = '';

    sql.query(function (err, check) {
        if (err) console.log(err);
        if (check[0]) {
            res.render('index_admin2.html',{account:check});
        }
    }, query, param);


});


module.exports = router;