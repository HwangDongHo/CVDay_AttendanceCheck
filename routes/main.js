var express = require('express');
var router = express.Router();
var sql = require('../DB/db_SQL')();
var io = require('socket.io')(8181);
var moment = require('moment');
var QRCode = require('qrcode');

io.sockets.on('connection', function (socket) {
  socket.on('check', function (data) {
    console.log('출석체크 :' + data);

    var time = moment().add(9,"hours").format("YYYY-MM-DD HH:mm:ss");
    var late = moment().hour(10).minute(0).second(0).format("YYYY-MM-DD HH:mm:ss");
    var diff = moment(time).diff(late,"hours");
    console.log(time);
    console.log(late);
    console.log(diff);

    var query = `INSERT INTO late_log (stu_num, check_time, how_late VALUES(?, ?, ?)`;
    var param = [data, time,late];

    socket.emit("recieve","출석됨");
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
  res.render('index_03.html',{
    email: req.session.user_id ,
    stu_num:req.session.stu_num ,
    name:req.session.user_name,
    image_qr:'http://cvlab308.cf/create_qr/'+req.session.stu_num
  });
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




