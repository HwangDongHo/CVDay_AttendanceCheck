var express = require('express');
var crypto = require('crypto');
var router = express.Router();
var sql = require('../DB/db_SQL')();

router.get('/admin', function(req, res, next) {
    res.render('index_admin.html');
});

router.get('/admin/main', function(req, res, next) {

    var query = `select * from account`;
    var param = '';

    var query1 = `select a.id,a.name,a.stu_num,a.email,a.kakaoid,a.phone_num,a.created,COUNT(*) AS cnt,sum(how_late) as total_late from account as a join late_log as b on a.stu_num = b.stu_num where month(b.check_time)= month(now()) AND how_late != 0 GROUP BY stu_num order by total_late DESC;`;

    sql.query(function (err, check) {
        if (err) console.log(err);
        if (check[0]) {

            sql.query(function (err, log) {
                if (err) console.log(err);
                if (log[0]) {
                    var rank = new Array();
                    var cnt = new Array();
                    var total_late = new Array();
                    for(var i =0;i<check.length;i++){
                        for(var j =0;j<log.length;j++){
                            if(check[i].stu_num == log[j].stu_num){
                                rank[i] = j+1;
                                cnt[i] = log[j].cnt;
                                total_late = log[j].total_late;
                            }
                        }
                    }

                    res.render('index_admin2.html',{account:check,rank:rank,cnt:cnt,total_late:total_late});
                }
            }, query1, param);




        }
    }, query, param);


});


module.exports = router;