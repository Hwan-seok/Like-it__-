var express = require('express');
const router = express.Router();
const sha = require('sha256');
const db = require('../lib/db.js'); 
var AWS = require('aws-sdk');
AWS.config.loadFromPath('lib/config.json');

const s3 = new AWS.S3();
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
let upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "hashtaglikeit",  //버켓 이름 넣어줌
    key: function (req, file, cb) { // 버켓에 담을 이름 설정
      let extension = path.extname(file.originalname);
      cb(null, Date.now().toString() + extension)
    },
    acl: 'public-read-write', //권한
  })
})
 
const fs = require('fs');
module.exports = (app) => {

    // const bodyParser = require('body-parser');
    // app.use(bodyParser.urlencoded({
    //     extended: false
    // }));
    // app.use(bodyParser.json());

    const passport = require('../lib/passport.js')(app); //passport 사용
  
    router.get('/register',(req,res)=>{
        console.log(app.mount);
        res.render('auth', {register:true});

    })
    router.get('/',(req,res)=>{
        console.log(req.url);
        res.render('auth', {register:false});

    })
    router.post('/login',
        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/login'
        })
    );
    router.post('/register',upload.single('file'), function (request, response) { //name= {id , password , nickname} 으로 받음 
        const post = request.body;
        const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz!@#$%^&*()";
        const string_length = 15;
        let salt = '';
        const file=request.file.location;
        console.log("file",request.file);
        console.log("dir",file);
        db.query('SELECT id FROM auth_local WHERE id=?', post.id, function (err, result) {
            if (result[0]) {
                
                return response.status(400).json({
                    SERVER_RESPONSE: 0,
                    SERVER_MESSAGE: "Existed ID"
                }) // 이미 존재하는 아이디이면 다시 팅김
            } else {
                for (var i = 0; i < string_length; i++) {
                    var rnum = Math.floor(Math.random() * chars.length);
                    salt += chars.substring(rnum, rnum + 1);
                }
                db.query("INSERT INTO auth_local values(?,?,?,?,?,?)", [post.id, sha(post.password + salt), post.nickname, salt,post.name,file], function (err) {
                    request.login(post, function (err) {
                        request.session.save(function () {
                            return response.redirect('/');
                        });
                    });
                });
            }
        });
    });
    router.get('/logout', function (request, response) {
        request.logout();
        response.redirect('/');
    });
    router.get('/kakao', passport.authenticate('kakao'));
    router.get('/kakao/callback', passport.authenticate('kakao'), function (request, response) {
        if (!request.user) {
            console.log("kakao_Wrong credentials");
            return response.status(400).json({
                SERVER_MESSAGE: "카카오 로그인 불가",
            }).redirect('/login');
        } else {
            console.log("kakao_logged in!");
            return response.redirect('/');
        }
    });
    return router;
};