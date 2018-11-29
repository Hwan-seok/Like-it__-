const passport_IO = require('./passport+socketio.js'),
    passportSocketIo = require("passport.socketio"),
    db = require('../lib/db.js');

module.exports = (server, app) => {

    const io = require('socket.io', )(server, {
        transports: ['websocket']
    });

    io.use(passportSocketIo.authorize(passport_IO)); //passport와 socketIO 연동 미들웨어 사용
    app.set('io', io); //io를 app.get("io")로 다른 라우터에서 접근 가능하게함
    const chat = io.of('/chat'); //chat namespace

    chat.on('connection', (socket) => { //네임스페이스 연결시 루프 동작
        let room;
        socket.to(room).emit('chat_sended_to_client', "LALALALALAL");
        socket.on('disconnecting', (reason) => {

            const sql = "DELETE FROM participants WHERE id=?"
            console.log(socket.request.user.nickname, room, '번방 퇴장');
            db.query(sql, [socket.request.user.id], (err, result) => { //퇴장할때 참가자 목록에서 뺌
                socket.leave(room);

                const msg = {};
                const user=socket.request.user;
                msg.time = socket.handshake.time.slice(0, 24);
                msg.sended = user.id;
                msg.sended_Nickname = user.nickname;
                msg.profile_image=user.profile_image;
                msg.description = `${msg.sended_Nickname}님이 퇴장하셨습니다.`;

                socket.to(room).emit("other_leaved_room", msg);
                room = 0;
            })
        })
        socket.on("connection", (roomnum) => { //방 접속시에 현재 방번호 room에 저장
            room = roomnum;
            console.log(socket.request.user.nickname, room, '번방 입장');
            socket.join(room); // x번 room에 join시킴
            const msg = {};
            const user= socket.request.user;
            msg.time = socket.handshake.time.slice(0, 24);
            msg.sended = `${user.id}`;
            msg.sended_Nickname = user.nickname;
            msg.profile_image = user.profile_image;
            msg.description = `${user.nickname}님이 들어오셨습니다.`

            const sql = 'INSERT INTO participants (room,id,name,nickname,profile_image) VALUES (?,?,?,?,?)'; //add user in room
            db.query(sql, [roomnum, user.id, user.name, user.nickname, user.profile_image], (err, result) => {
                chat.to(room).emit("new_user_in", msg); //방에 속한 모든 사람들에게 내가 들어왔음을 알림
            })
        })
        socket.on('chat_sended_to_server', (data) => { //
            console.log('chat received', socket.request.user.id, data);
            const msg = {};
            msg.time = socket.handshake.time.slice(0, 24);
            msg.sended = `${socket.request.user.id}`;
            msg.sended_Nickname = socket.request.user.nickname;
            msg.profile_image = socket.request.user.profile_image;
            msg.description = data;
            console.log(room);
            const sql = 'INSERT INTO chat (room, description,sended,sended_nickname,time,profile_image) VALUES (?,?,?,?,?,?)';
            db.query(sql, [room, msg.description, msg.sended, msg.sended_Nickname, msg.time, msg.profile_image]); //채팅한 말 객체들의 배열 [ { room : 10  "sended":"YOUT","sended_NickName":"YOU" , time : "now" , description : "lala", profile_image : "!@#@!#"} ,  ... ]
            chat.to(room).emit('chat_sended_to_client', msg);
        });
    })



}
