var io = require('socket.io')(8181);


module.exports = function () {
    return {
        connect: function(){
            io.sockets.on('connection', function (socket) {
                console.log("enter user : " + socket.id);
                socket.on('check', function (data) {
                    console.log('서버에서 수신 :'+data);
                });
            });
        },
        emit: function(socket,message){
            io.sockets.emit(socket,message);
        }
    }
};