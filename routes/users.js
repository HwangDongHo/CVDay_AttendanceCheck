var express = require('express');
var router = express.Router();

/* GET users listing. */
router.post('/main', function(req, res, next) {
  res.render('qrcodetest.html');
});

module.exports = router;
