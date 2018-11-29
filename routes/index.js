var express = require('express');
var router = express.Router();
const authCheck = require('../lib/auth_check.js');
const db = require('../lib/db.js');
/* GET home page. */

router.get('/', function (req, res, next) {

  res.render('index', {
    main: req.user
  });
});
router.get('/contents/:category/page/:page', authCheck, (req, res) => {

  const sql = "SELECT num,name,owner,likes FROM rooms WHERE contents=? LIMIT ?,?";
  const category = req.params.category;
  const page = (req.params.page * 10) - 10; // 파라미터 page가 1이면 0 ,2이면 10  
  const pageLimit = 10;
  let page_num = 0;

  //page 부터 10개(pagelimit)씩 검색하여 렌더링함  
  db.query(sql, [category, page, pageLimit], (err, rooms) => {
    db.query(sql, [category, 0, 10000], (err, pages) => {
      page_num = Math.floor(pages.length / 10) + 1 //페이지의 개수 파악

      res.render('rooms', {
        main: req.user,
        category: req.params.category,
        rooms,
        current_page: req.params.page *= 1, //string -> int 형변환
        page_num
      });
    })
  })
})
router.get('/contents/:category/makeroom', authCheck, (req, res) => {
  const category = req.params.category;

  res.render('makeRoom', {
    main: req.user,
    category: req.params.category
  });
})
router.post('/contents/:category/makeroom', authCheck, (req, res) => {
  const contents = req.params.category;
  const name = req.body.name;
  const owner = req.user.nickname;
  const likes = req.body.likes;
  const sql = "INSERT INTO rooms (contents,name,owner,likes) VALUES (?,?,?,?)";
  const LAST = "SELECT LAST_INSERT_ID() AS id";

  db.query(sql, [contents, name, owner, likes], (err, result) => { //방정보 db삽입
    db.query(LAST, (err, id) => { //방금 삽입한 방 정보 가져옴
      res.redirect(`/contents/${contents}/room/${id[0].id}`) //방금 만든 방으로 리다이렉 시킴
    })
  })
})
router.get('/contents/:category/room/:room', authCheck, (req, res) => {
  let new_room=false;
  const user = req.user;
  const sql_1= "SELECT * FROM rooms where num=?"; //room info
  const sql_2 = "Select * From participants WHERE room=?"; //participants
  const sql_3 = "Select * From chat WHERE room=?"; //chat
  const roomnum=req.params.room *= 1;
  const category=req.params.room;
    db.query(sql_1,req.params.room,(err,result)=>{
      // 방 정보 
      const roomname=result[0].name;
    db.query(sql_2, [req.params.room], (err, people) => {
      //방에 참가하고 있는 인원들 객체 배열 [ {"id":"1123",name: "asdfa","nickname":"LALA" ,"profile_image":"123"} , ... ]
      db.query(sql_3, [req.params.room], (err, chat) => {
        //채팅한 말 객체들의 배열 [ { "sended":"YOUT","sended_nickName":"YOU" , time : "now" , description : "lala", profile_image : "!@#@!#"} ,  ... ]
        if(chat[0]==undefined)
          new_room=true;
        res.render('chat', {
          main: req.user,
          chat,
          roomnum,
          people,
          new_room,
          category,
          roomname
        })
      }) 
    })
  })
})
router.get('/favicon.ico',(req,res)=>{
  res.send('./favicon.ico');
})



module.exports = router;