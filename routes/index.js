var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db = mysql.createConnection({
  host:'db.cpwxmow3ltbq.ap-northeast-2.rds.amazonaws.com',
  user:'cvserver',
  password:'ehdghghkd1',
  database:'TF',
  port: 3306
});

db.connect(function(error){
  if(!!error)
  {
    console.log(error);
    console.log('Error');
  }
  else
  {
    console.log('DB connected!');
  }
});

console.log("server on!");

router.get('/', function(req, res, next) {
  res.render('index.html');
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
    db.query(`SELECT * FROM account WHERE stu_num = ${stu_num}`, function (err, check) {
      //console.log(check);
      if (check[0]) {
        res.send({result: true, check: 'no'});
        //console.log('used');
      } else {
        res.send({result: true, check: 'yes'});
        //console.log('Not used');
      }
    });
  }
});

router.post('/check_email',function(req, res){
  var email = req.body.email;
  if(!email){
    res.send({result: false, check: 'no'});
  }
  else {
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
  }
});





router.post('/account/success', function(req,res,next){
  var name = req.body.name;
  var stu_num = req.body.student_number;
  var email = req.body.email;
  var kakao = req.body.kakao;
  var phone = req.body.phone;
  var password = req.body.password
  var sql = `INSERT INTO account (name, stu_num, email,kakaoid,phone_num,password,created) VALUES(?, ?, ?,?,?,?,NOW())`;
  var params = [name, stu_num, email,kakao,phone,password];
  db.query(sql, params,function(error, result) {
    if (error) {
      throw error;
    }
  });
  res.render('index_02.html');
});

module.exports = router;