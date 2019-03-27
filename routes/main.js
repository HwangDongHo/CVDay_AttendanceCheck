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



router.post('/main', function(req, res, next) {
  res.render('qrcodetest.html');
});

module.exports = router;
