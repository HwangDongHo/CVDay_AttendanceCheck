var pool = require('./db_connect');

module.exports = function () {
    return {
        query: function(callback,sql,param){
            pool.getConnection(function(err, con){
                con.query(sql,param, function (err, result, fields) {
                    con.release();
                    if (err) return callback(err);
                    callback(null, result);
                });
            });
        },
        pool: pool
    }
};
