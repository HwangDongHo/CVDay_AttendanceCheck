
var express = require('express');
var router = express.Router();

var sql = require('../DB/db_SQL')();

var moment = require('moment');



router.post('/login', function(req, res, next) {
  var email = req.body.email;
  var password = req.body.password;
  var query = `select * from account WHERE email = '${email}' AND password = '${password}'`;
  var param = ''

  sql.query(function (err, check) {
    if (err) console.log(err);
    if (check[0]) {
      req.session.logined = true;
      req.session.user_id = email;
      req.session.user_name = check[0].name;
      req.session.stu_num = check[0].stu_num;
      res.redirect("/main");
    } else {
      res.redirect("/");
    }
  }, query, param);

});


router.get('/main', function(req, res, next) {
  res.render('index_03.html',{ email: req.session.user_id , stu_num:req.session.stu_num , name:req.session.user_name});
});


router.get('/logout', function(req, res, next){
  req.session.destroy();
    res.redirect('/');
});

router.post('/check_time', function(req, res, next){
  var time = moment().format("YYYY-MM-DD HH:mm:ss");
  res.send({result: true, time: time});
});





module.exports = router;




