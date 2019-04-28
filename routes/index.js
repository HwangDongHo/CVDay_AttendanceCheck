var express = require('express');
var crypto = require('crypto');
var router = express.Router();

var sql = require('../DB/db_SQL')();

console.log("server on!");

router.get('/', function(req, res, next) {
    if(req.session.logined)
      res.redirect("/main");
    else {
      res.render('index.html');
    }
});

router.get('/account', function(req, res, next) {
  res.render('index_01.html');
});

router.post('/check_stnum',function(req, res){
  var stu_num = req.body.student_number;
  if(!stu_num) {
    res.send({result: false, check: 'no'});
  }
  else {
    var query = `SELECT * FROM account WHERE stu_num = ${stu_num}`
    var param = '';
    sql.query(function(err, check){
      if (err) console.log(err);
      //console.log(check)
      if (check[0]) {
        res.send({result: true, check: 'no'});
      } else {
        res.send({result: true, check: 'yes'});
      }
      //sql.pool.end(function(err){if (err) console.log(err);});
    },query,param);
    /*
    var query = `SELECT * FROM account WHERE stu_num = ${stu_num}`
    var param = ''
    db.query(sql, param,function (err, check) {
      //console.log(check);
      if (check[0]) {
        res.send({result: true, check: 'no'});
        //console.log('used');
      } else {
        res.send({result: true, check: 'yes'});
        //console.log('Not used');
      }
    });
    */
  }
});

router.post('/check_email',function(req, res){
  var email = req.body.email;
  if(!email){
    res.send({result: false, check: 'no'});
  }
  else {
    var query = `SELECT * FROM account WHERE email = '${email}'`
    var param = '';
    sql.query(function(err, check){
      if (err) console.log(err);
      //console.log(check)
      if (check[0]) {
        res.send({result: true, check: 'no'});
      } else {
        res.send({result: true, check: 'yes'});
      }
      //sql.pool.end(function(err){if (err) console.log(err);});
    },query,param);
    /*
    db.query(`SELECT * FROM account WHERE email = '${email}'`, function (err, check) {
      //console.log(check);
      if (check[0]) {
        res.send({result: true, check: 'no'});
        //console.log('used');
      } else {
        res.send({result: true, check: 'yes'});
        //console.log('Not used');
      }
    });
    */
  }
});


router.post('/account/success', function(req,res,next){
  var name = req.body.name;
  var stu_num = req.body.student_number;
  var email = req.body.email;
  var kakao = req.body.kakao;
  var phone = req.body.phone;
  var password = req.body.password;

  var salt = Math.round((new Date().valueOf() * Math.random())) + "";
  var hashPassword = crypto.createHash("sha512").update(password + salt).digest("hex");

  var query = `INSERT INTO account (name, stu_num, email,kakaoid,phone_num,password,salt,created) VALUES(?, ?, ?,?,?,?,?,DATE_ADD(NOW(), INTERVAL 9 HOUR))`;
  var param = [name, stu_num, email,kakao,phone,hashPassword,salt];

  sql.query(function(err, check){
    if (err) console.log(err);
  },query,param);

  res.render('index_02.html');
});

module.exports = router;