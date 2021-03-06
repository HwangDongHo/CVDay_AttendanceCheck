var express = require('express');
var router = express.Router();
var sql = require('../DB/db_SQL')();
var io = require('socket.io')(8181);
var moment = require('moment');
var QRCode = require('qrcode');
var crypto = require('crypto');
var Slack = require('slack-node');
const tocken = require('../../data/data').slack.token;
const slack = new Slack(tocken);
const send = async(message) => {
  slack.api('chat.postMessage', {
    username: 'dev-test',  // 슬랙에 표시될 봇이름
    text:message,
    as_user:true,
    channel:'#account'  // 전송될 채널 및 유저
  }, function(err, response){
    console.log(response);
  });
}

io.sockets.on('connection', function (socket) {
  socket.on('check', function (data) {
    console.log('출석체크 :' + data);
    var query = `SELECT * FROM account WHERE stu_num = ${data}`;
    var param = '';
    sql.query(function(err, check){
      if (err) console.log(err);
      if (check[0]) {
        data = check[0].stu_num;
        var name = check[0].name;
        var query = `SELECT stu_num,date_format(check_time, '%Y-%m-%d %T') As date,how_late FROM late_log where DAYOFMONTH(check_time) = DAYOFMONTH(DATE_ADD(NOW(), INTERVAL 9 HOUR)) AND stu_num = ${data}`;
        var param = '';
        sql.query(function(err, check){
          if (err) console.log(err);
          if (check[0]) {
            console.log("already checked!");
            socket.emit("recieve","already checked");
          } else {
            var time = moment().add(9,"hours").format("YYYY-MM-DD HH:mm:ss");
            var late = moment().add(9,"hours").hour(10).minute(11).second(0).format("YYYY-MM-DD HH:mm:ss");
            var minute = moment(time).diff(late,"minute");
            if(minute<0) minute =0;
            //console.log(time+"  "+late+"  "+minute+"분  "+minute*200+"원");
            if(minute!=0) send(name+'님이 '+minute+'분 지각하셨습니다. '+minute*200+'원 납부해주세요');
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


  var query = `select * from account WHERE email = '${email}'`;
  var param = '';

  sql.query(function (err, check) {
    if (err) console.log(err);
    if (check[0]) {
      var salt = check[0].salt;
      var password = req.body.password;
      var hashPassword = crypto.createHash("sha512").update(password + salt).digest("hex");

      query = `select * from account WHERE email = '${email}' AND password = '${hashPassword}'`;
      param = '';

      sql.query(function (err, data) {
        if (err) console.log(err);
        if (data[0]) {
          req.session.logined = true;
          req.session.user_id = email;
          req.session.user_name = data[0].name;
          req.session.stu_num = data[0].stu_num;
          res.send({check:'yes'});
        } else {
          res.send({check:'no'});
        }
      }, query, param);

    } else {
      res.send({check:'no'});
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
  var param = '';
  sql.query(function (err, check) {
    if (err) console.log(err);
    if (check[0]) {
      res.render('index_test.html',{data:check});
    }else{
      res.render('index_test.html',{data:check});
    }
  }, query, param);

});


router.get('/rank', function(req, res, next) {
  var query3 = `SELECT stu_num,CONCAT(YEAR(check_time), '-', MONTH(check_time)) ym, COUNT(*) AS cnt ,sum(how_late) AS plus FROM late_log where month(check_time) = month(now()) AND how_late != 0 GROUP BY ym,stu_num ORDER BY plus DESC;`;
  var param3 = '';

  sql.query(function (err, ranking) {
    if (err) console.log(err);

    if (ranking[0]) {
      res.render('rank.html',{data:ranking});
    }else{
      res.render('rank.html',{data:ranking});
    }
  }, query3, param3);
});

router.get('/logout', function(req, res, next){
  req.session.destroy();
    res.redirect('/');
});

router.post('/check_time', function(req, res, next){
  if(req.session.logined)
  {
    var stu_num = req.session.stu_num;
    var time = moment().add(9,"hours").format("YYYY-MM-DD HH:mm:ss");
    var query = `SELECT stu_num,date_format(check_time, '%Y-%m-%d %T') As date,how_late FROM late_log where DAYOFMONTH(check_time) = DAYOFMONTH(DATE_ADD(NOW(), INTERVAL 9 HOUR)) AND stu_num = ${stu_num}`
    var param = '';
    sql.query(function(err, check){
      if (err) console.log(err);

      var query3 = `SELECT stu_num,CONCAT(YEAR(check_time), '-', MONTH(check_time)) ym, COUNT(*) AS cnt ,sum(how_late) AS plus FROM late_log where month(check_time) = month(now()) AND how_late != 0 GROUP BY ym,stu_num ORDER BY plus DESC;`;
      var param3 = '';


      sql.query(function (err, ranking) {
        if (err) console.log(err);

        var times = 0;
        var rank = 0;
        var total = 0;

        if (ranking[0]) {
          for(var i =0;i<ranking.length;i++){
            if(req.session.stu_num == ranking[i].stu_num) {
              times = ranking[i].cnt;
              rank = i + 1;
              total = ranking[i].plus * 200;
            }
          }
          if (check[0]) {
            res.send({result: true, time: time,attend_time:check[0].date,late_time:check[0].how_late,times:times,rank:rank,total:total});
          } else {
            res.send({result: 3, time: time,times:times,rank:rank,total:total});
          }

        }else{
          if (check[0]) {
            console.log(times+" "+rank+" "+total);
            res.send({result: true, time: time,attend_time:check[0].date,late_time:check[0].how_late,times:times,rank:rank,total:total});
          } else {
            res.send({result: 3, time: time,times:times,rank:rank,total:total});
          }
        }
      }, query3, param3);


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