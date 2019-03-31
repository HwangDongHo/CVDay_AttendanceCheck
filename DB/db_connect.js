var mysql = require('mysql');
var config = require('./db_info').aws;
/*
module.exports = function () {
    return {
        init: function () {
            return mysql.createConnection({
                host: config.host,
                port: config.port,
                user: config.user,
                password: config.password,
                database: config.database
            })
        },
        connect: function (con) {
            con.connect(function (err) {
                if (err) {
                    console.error('mysql connection error :' + err);
                } else {
                    console.info('mysql is connected successfully.');
                }
            })
        }
    }
};
*/

module.exports = function () {
    var pool = mysql.createPool({
        host: config.host,
        user: config.user,
        password: config.password,
        database: config.database
    });
    console.log('create mysql pool ! ')
    return {
        getConnection: function (callback) {    // connection pool을 생성하여 리턴합니다
            pool.getConnection(callback);
        },
        end: function(callback){
            pool.end(callback);
        }
    }
}();


