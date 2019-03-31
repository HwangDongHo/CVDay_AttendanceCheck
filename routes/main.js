
var express = require('express');
var router = express.Router();

var sql = require('../DB/db_SQL')();



router.post('/login', function(req, res, next) {
  var email = req.body.email;
  var password = req.body.password;
  var query = `select email,password,stu_num from account WHERE email = '${email}' AND password = '${password}'`;
  var param = ''

  sql.query(function (err, check) {
    if (err) console.log(err);
    if (check[0]) {
      req.session.logined = true;
      req.session.user_id = email;
      req.session.stu_num = check[0].stu_num;
      res.redirect("/main");
    } else {
      res.redirect("/");
    }
  }, query, param);

});


router.get('/main', function(req, res, next) {
  res.render('qrcodetest.html',{ email: req.session.user_id , stu_num:req.session.stu_num });
});


router.get('/logout', function(req, res, next){
  req.session.destroy();
    res.redirect('/');
});





module.exports = router;




