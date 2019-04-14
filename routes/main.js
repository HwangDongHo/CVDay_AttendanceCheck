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
        var time = moment().add(9,"hours").format("YYYY-MM-DD HH:mm:ss"); var time_string = time.toString();
        var late = moment().hour(10).minute(0).second(0).format("YYYY-MM-DD HH:mm:ss");
        var minute = moment(time).diff(late,"minute");
        console.log(time+"  "+minute+"분  "+minute*200+"원");

        var query2 = `INSERT INTO late_log (stu_num,check_time,how_late) VALUES(?,?,?)`;
        var param2 = [data,time,minute];

        sql.query(function(err, check){
          if (err) console.log(err);
        },query2,param2);

        socket.emit("recieve","checked");
      } else {
        console.log("not registered!");
        socket.emit("recieve","not registered");
      }
    },query,param);

  /*
  socket.on('check2', function (data) {
    var query3 = `SELECT stu_num,CONCAT(YEAR(check_time), '-', MONTH(check_time)) ym, COUNT(*) AS cnt ,sum(how_late) AS plus FROM late_log where month(check_time) = month(now()) GROUP BY ym,stu_num ORDER BY cnt DESC;`;
    var param3 = '';
    sql.query(function (err, check) {
      if (err) console.log(err);
      if (check[0]) {
        for(var i =0;i<check.length;i++){
          console.log(check[i].plus);
        }

      } else {
        console.log("no")
      }
    }, query3, param3);
  });*/
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
  var query3 = `SELECT stu_num,CONCAT(YEAR(check_time), '-', MONTH(check_time)) ym, COUNT(*) AS cnt ,sum(how_late) AS plus FROM late_log where month(check_time) = month(now()) GROUP BY ym,stu_num ORDER BY cnt DESC;`;
  var param3 = '';
  sql.query(function (err, check) {
    if (err) console.log(err);
    if (check[0]) {
      var time = 0;
      var rank = 0;
      var total = 0;
      for(var i =0;i<check.length;i++){
        if(req.session.stu_num == check[i].stu_num)
          time = check[i].cnt;
          rank = i;
          total = check[i].plus*200;
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
        late_times:"error",
        late_rank:"error"
      });
    }
  }, query3, param3);

});

router.get('/test', function(req, res, next) {
  res.render('index_test');
});

router.get('/logout', function(req, res, next){
  req.session.destroy();
    res.redirect('/');
});

router.post('/check_time', function(req, res, next){
  var time = moment().add(33,"hours").format("YYYY-MM-DD HH:mm:ss");
  res.send({result: true, time: time});
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