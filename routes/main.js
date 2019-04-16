var express = require('express');
var router = express.Router();
var sql = require('../DB/db_SQL')();
var io = require('socket.io')(8181);
var moment = require('moment');
var QRCode = require('qrcode');

io.sockets.on('connection', function (socket) {

  socket.on('check', function (data) {
    console.log('출석체크 :' + data);
    var query = `SELECT * FROM account WHERE stu_num = ${data}`;
    var param = '';
    sql.query(function(err, check){
      if (err) console.log(err);
      if (check[0]) {

        var query = `SELECT stu_num,date_format(check_time, '%Y-%m-%d %T') As date,how_late FROM late_log where DAYOFMONTH(check_time) = DAYOFMONTH(DATE_ADD(NOW(), INTERVAL 9 HOUR)) AND stu_num = ${data}`
        var param = '';
        sql.query(function(err, check){
          if (err) console.log(err);
          if (check[0]) {
            console.log("already checked!");
            socket.emit("recieve","already checked");
          } else {
            var time = moment().add(9,"hours").format("YYYY-MM-DD HH:mm:ss");
            var late = moment().add(9,"hours").hour(10).minute(0).second(0).format("YYYY-MM-DD HH:mm:ss");
            var minute = moment(time).diff(late,"minute");
            if(minute<0) minute =0;
            console.log(time+"  "+late+"  "+minute+"분  "+minute*200+"원");

            var query2 = `INSERT INTO late_log (stu_num,check_time,how_late) VALUES(?,?,?)`;
            var param2 = [data,time,minute];

            sql.query(function(err, check){
              if (err) console.log(err);
            },query2,param2);

            socket.emit("recieve","checked");
            socket.emit("page",{time:time,late:minute});
          }
        },query,param);


      }else{
        console.log("not registered!");
        socket.emit("recieve","not registered");
      }
    },query,param);
  });

});


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
  var query3 = `SELECT stu_num,CONCAT(YEAR(check_time), '-', MONTH(check_time)) ym, COUNT(*) AS cnt ,sum(how_late) AS plus FROM late_log where month(check_time) = month(now()) AND how_late != 0 GROUP BY ym,stu_num ORDER BY plus DESC;`;
  var param3 = '';
  sql.query(function (err, check) {
    if (err) console.log(err);
    if (check[0]) {
      var time = 0;
      var rank = 0;
      var total = 0;
      for(var i =0;i<check.length;i++){
        if(req.session.stu_num == check[i].stu_num) {
          time = check[i].cnt;
          rank = i+1;
          total = check[i].plus * 200;
        }
      }
      res.render('index_03.html',{
        email: req.session.user_id ,
        stu_num:req.session.stu_num ,
        name:req.session.user_name,
        image_qr:'http://cvlab308.cf/create_qr/'+req.session.stu_num,
        late_times:time,
        late_rank:rank,
        total_m:total
      });

    } else {
      res.render('index_03.html',{
        email: req.session.user_id ,
        stu_num:req.session.stu_num ,
        name:req.session.user_name,
        image_qr:'http://cvlab308.cf/create_qr/'+req.session.stu_num,
        late_times:"0",
        late_rank:"0",
        total_m:"0"
      });
    }
  }, query3, param3);

});

router.get('/test', function(req, res, next) {
  var query = `select * from late_log;`;
  var param = ''

  sql.query(function (err, check) {
    if (err) console.log(err);
    if (check[0]) {
      res.render('index_test.html',{data:check});
    }else{
      res.render('index_test.html',{data:check});
    }
  }, query, param);

});

router.get('/logout', function(req, res, next){
  req.session.destroy();
    res.redirect('/');
});

router.post('/check_time', function(req, res, next){
  console.log("check_time");
  if(req.session.logined)
  {
    console.log("check_time2");
    var stu_num = req.session.stu_num;
    var time = moment().add(9,"hours").format("YYYY-MM-DD HH:mm:ss");
    var query = `SELECT stu_num,date_format(check_time, '%Y-%m-%d %T') As date,how_late FROM late_log where DAYOFMONTH(check_time) = DAYOFMONTH(DATE_ADD(NOW(), INTERVAL 9 HOUR)) AND stu_num = ${stu_num}`
    var param = '';
    sql.query(function(err, check){
      console.log("check_time3");
      if (err) console.log(err);
      var query2 = `SELECT stu_num,CONCAT(YEAR(check_time), '-', MONTH(check_time)) ym, COUNT(*) AS cnt ,sum(how_late) AS plus FROM late_log where month(check_time) = month(now()) AND how_late != 0 GROUP BY ym,stu_num ORDER BY plus DESC;`;
      var param2 = '';
      sql.query(function (err, check2) {
        if (err) console.log(err);
        console.log("check_time4");
        if (check2[0]) {
          var time = 0;
          var rank = 0;
          var total = 0;
          for(var i =0;i<check2.length;i++) {
            if (req.session.stu_num == check2[i].stu_num) {
              time = check2[i].cnt;
              rank = i + 1;
              total = check2[i].plus * 200;
            }
          }

          if (check[0]) {
            res.send({result: true, time: time,attend_time:check[0].date,late_time:check[0].how_late});
          } else {
            res.send({result: 3, time: time});
          }
        }
      }, query2, param2);
    },query,param);
  }
  else{
    res.send({result: false});
  }

});


router.get('/create_qr/:qrcode',(req, res) =>{
  let inputStr = req.params.qrcode;
  var opts = {
    errorCorrectionLevel: 'H',
    type: 'image/jpeg',
    rendererOpts: {
      quality: 1
    }
  }

  QRCode.toDataURL(inputStr, {version:1},function (err, url) {
    let data = url.replace(/.*,/,'');
    let img = new Buffer(data,'base64');
    res.writeHead(200,{
      'Content-Type' : 'image/png',
      'Content-Length' : img.length
    })
    res.end(img)
  })
})

module.exports = router;