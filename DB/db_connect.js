var mysql = require('mysql');
var config = require('./db_info').aws;

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


