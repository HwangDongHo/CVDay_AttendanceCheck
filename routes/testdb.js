var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db = mysql.createConnection({
    host:'localhost',
    user:'mysql',
    password:'cvlab',
    database:'testdb'
});

db.connect();

/* GET home page. */
router.get('/test', function(req, res, next) {


    res.render('index_test.html', { late: 'yes' });
});

router.post('/test/send_email', function(req,res){
    var list = ``;
    var i = 0;
    db.query('INSERT INTO testdb2 (email) VALUES(?)',[req.body.email],function(error, result) {
        if (error) {
            throw error;
        }
    });
    db.query('SELECT * FROM testdb2', function (error, account, fields) {
        if (error) {
            console.log(error);
        }

        while(i<account.length){
            list = list + `id: ${account[i].id}     email: ${account[i].email}<br>`
            i = i+1
        }
        res.send(list);
    });
});

module.exports = router;