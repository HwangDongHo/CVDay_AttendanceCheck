var express = require('express');
var router = express.Router();

router.post('/main', function(req, res, next) {
  res.render('qrcodetest.html');
});

module.exports = router;
