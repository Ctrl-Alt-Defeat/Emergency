
'use strict';
const express = require('express');
const app = express();

var cors = require('cors')
require("dotenv").config();

app.use(cors());
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
// app.use(express.static(path.join(__dirname, 'public')));
const methodOverride = require('method-override');
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(methodOverride('_method'));
const port = process.env.PORT || 3000;
const superagent = require('superagent');
let status = 'Ok';
const pg = require('pg');
// const client = new pg.Client({ connectionString: process.env.DATABASE_URL,   ssl: { rejectUnauthorized: false } });
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
// ===================================================== Map =========================================================
app.get('/map', laodMapPage);
app.post('/map', getUsersLocations);
app.post('/message/:id', sendMessage);
app.get('/', home);
app.post('/schedule/:id',saveSchedule);

function home(req, res) {
  res.render('index');

};


function getUsersLocations(req, res) {
  return getAllLocationsFromDB(req.body.work, req.body.experience).then(data => {
    console.log(data, 'data');
    res.send(data);
  }).catch(error => {
    console.log(error);
  })
};
function getAllLocationsFromDB(work, experience) {
  let selectQuery = 'SELECT * FROM USERS WHERE type_of_work = $2 and exp >= $1 and role = 1';
  experience = experience || 0;
  let safeArr = [experience, work]
  if (work == 'All') {
    selectQuery = 'SELECT * FROM USERS WHERE exp >= $1 and role = 1'
    safeArr = [experience]
  };
  return client.query(selectQuery, safeArr).then(data => {
    return data.rows
  }).catch(error => {
    console.log(error)
  });
}

// ==================================================================================================================

function handelError(res, error) {
  res.render('pages/error', { error: error });
};

function laodMapPage(req, res) {
  res.render('pages/map');
};
// ======================= Acconut page geting from database=====================
app.get('/login/acconut/:id', handleAcconutPage);
function handleAcconutPage(req, res) {
  let id = req.params.id;
  let selectFromDB = 'SELECT * FROM users WHERE id = $1;';
  let safeValue = [id];
  return client.query(selectFromDB, safeValue).then(data => {
    let accountDB = data.rows[0];
    let allData = new AccountDB(accountDB.full_name, accountDB.role, accountDB.location, accountDB.img, accountDB.type_of_work, accountDB.email, accountDB.phone_num, accountDB.status, accountDB.exp, accountDB.username);
    let selectFromFeedbacksDB = 'SELECT users.img as img, users.username as username, users.id as user_id, feedback.id as id, feedback.text as text FROM feedback INNER JOIN users ON (USERS.id = feedback.owner_id) WHERE user_id = $1;';
    return client.query(selectFromFeedbacksDB, safeValue).then(dataFeedbacks => {
      // console.log(dataFeedbacks.rows)
      //constructor for the data text img username
      let feedbackArray = [];
      dataFeedbacks.rows.forEach(element => {
        let text= element.text;
        let username=element.username;
        let img=element.img
        let user_id=element.user_id;

        let feedQuery= new Feedback(username,text,img,user_id);
        feedbackArray.push(feedQuery);
      });

      res.render('pages/accountNew', { data: data.rows[0], is_not_enable: req.query.is_not_enable, dataFeedbacks: feedbackArray });
      let scheduleFromSchedulsDB = 'SELECT * FROM schedule WHERE user_id = $1;';
      return client.query(scheduleFromSchedulsDB, safeValue).then(dataSchedule => {
        console.log(dataSchedule.rows[0]);
        res.render('pages/accountNew', { data: data.rows[0], is_not_enable: req.query.is_not_enable, dataFeedbacks: dataFeedbacks.rows, dataSchedule: dataSchedule.rows });
      })
      
    }).catch(error => {
      console.log(`an error occurred while getting task with ID number ${id} from DB ${error}`);
    })
  }).catch(error => {
    console.log(`an error occurred while getting task with ID number ${id} from DB ${error}`);
  });
}

function Feedback(username,text,img,userid){
  this.username=username;
  this.text=text;
  this.img= img || "https://cdn0.iconfinder.com/data/icons/user-profiles-avatars/128/12-512.png";
  this.user_id=userid;

}

function AccountDB(full_name, role, location, img, type_of_work, email, phone_num, status, exp, username) {
  this.name = full_name;
  this.role = role;
  this.location = location;
  this.image = img || 'https://th.bing.com/th/id/R3c1dd0093935902659e99bef56aa4ce6?rik=TkZVVEIDxl7BHg&riu=http%3a%2f%2fwww.hrzone.com%2fsites%2fall%2fthemes%2fpp%2fimg%2fdefault-user.png&ehk=0ucrW6JgY6Y8fhtviTtcBYQ9YIjqHM3Pg0E65sHK7VU%3d&risl=&pid=ImgRaw';
  this.work = type_of_work;
  this.email = email;
  this.phone = phone_num;
  this.status = status;
  this.exp = exp;
  this.username = username;
}

// {{{{{login}}}}}________________________
app.get('/log_Page', (req, res) => {
  let oldStatus = status;
  status = 'Ok';
  res.render('pages/login', { status: oldStatus });
})

//===========================Sign up==================================

app.post('/signUp', (req, res) => {
  let body = req.body;
  var full_name = body.full_name;
  let role = body.role;
  let location = body.location;
  let typeOfwork = body.type_of_work;
  let email = body.email;
  let userName = body.user_name;
  let password = body.password;
  let phoneNum = body.phone_num;
  let status = body.status;
  let insertQuery = 'INSERT INTO users (full_name,role,location,type_of_work,email,password,phone_num,username,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *;'

  let safeValue = [full_name, role, location, typeOfwork, email, password, phoneNum, userName, status];


  client.query(insertQuery, safeValue).then(data => {
    res.redirect(`/login/acconut/${data.rows[0].id}?is_not_enable=${false}`);
  }).catch(error => {
    res.status(500).send(`Sorry an error has accord while loading the page  ${error} `);
  });
});




//===============================================feedback=============================================

app.post('/feedback/:id',(req,res)=>{

  let body = req.body;
  console.log(body); 
 
  let text = body.feedback;
  let ownerid= body.ownerid;
  let userid=req.params.id;

  let insertQuery= 'INSERT INTO feedback(text,owner_id,user_id) VALUES ($1,$2,$3) RETURNING *;';
  let safeValue= [text,ownerid,userid];
  
 
  client.query(insertQuery,safeValue).then(data=>{
   res.redirect(`/login/acconut/${req.params.id}?is_not_enable=${false}`);
  }).catch(error=>{
    console.log('error has been detected ...',error);
  });
 
 });


 //================================Delete feedback =============================


 app.delete('/deleteFeedback/:id',(req,res)=>{

   let id = req.params.id;
   console.log(id);
   
   let deleteQuery= 'DELETE FROM feedback WHERE user_id=$1;';
   let safeValue= [id];
 
   client.query(deleteQuery,safeValue).then(()=>{
    res.redirect(`/login/acconut/${id}?is_not_enable=${false}`);
  }).catch(error=>{
     console.log('errrrroooooooooooorrr   ', error)
 
   });
 });
 
 //=========================================
 
//====================================================================================



// ==============[SALAH] Contact Us Page And Getting All Messages to another page =====================
let arrayOfImages = ["https://images.generated.photos/ERWujtGdPrsx5TqtmelYDCs05-YcdEG6yYS08QsRUsw/rs:fit:512:512/wm:0.95:sowe:18:18:0.33/Z3M6Ly9nZW5lcmF0/ZWQtcGhvdG9zL3Yz/XzAwMjMwNDYuanBn.jpg", "https://images.generated.photos/IF0Qumz-zv_fj3_hV2pBNxiJox6lGX8IALzPxyXZVX8/rs:fit:512:512/wm:0.95:sowe:18:18:0.33/Z3M6Ly9nZW5lcmF0/ZWQtcGhvdG9zL3Yz/XzAzNDY2MjcuanBn.jpg", "https://images.generated.photos/5E9zLcP6CYOVmBeBVUTMct13o6nUQwMcvKEX3c599jc/rs:fit:512:512/wm:0.95:sowe:18:18:0.33/Z3M6Ly9nZW5lcmF0/ZWQtcGhvdG9zL3Yz/XzA0MTAyMjIuanBn.jpg", "https://images.generated.photos/oTW6oNJjkB-EzPaL_rjYDJcW7-VIJZFJJBF_nltC7gw/rs:fit:512:512/wm:0.95:sowe:18:18:0.33/Z3M6Ly9nZW5lcmF0/ZWQtcGhvdG9zL3Yz/XzA3ODE4NTQuanBn.jpg", "https://images.generated.photos/aPCmpRaC6WP6FbspiNg3wbb5oxSmMt1AdPpjPIWgbcs/rs:fit:512:512/wm:0.95:sowe:18:18:0.33/Z3M6Ly9nZW5lcmF0/ZWQtcGhvdG9zL3Yz/XzA5MDc2NDYuanBn.jpg", "https://images.generated.photos/ZQbIEOo9TXCPc0E4z9TxfHkTF764mSzVzlcxf1dUkEE/rs:fit:512:512/wm:0.95:sowe:18:18:0.33/Z3M6Ly9nZW5lcmF0/ZWQtcGhvdG9zL3Yz/XzAyMzkwNDUuanBn.jpg", "https://images.generated.photos/e0waIObdOx1KD0bggTDlLalQyabvL1RmGcbPFxovBvw/rs:fit:512:512/wm:0.95:sowe:18:18:0.33/Z3M6Ly9nZW5lcmF0/ZWQtcGhvdG9zL3Yz/XzA1MjM3MjguanBn.jpg", "https://images.generated.photos/dLLq4A9O4EA9KgcK65BpCOtoNGlxCfXn0ILrVmvnFlA/rs:fit:512:512/wm:0.95:sowe:18:18:0.33/Z3M6Ly9nZW5lcmF0/ZWQtcGhvdG9zL3Yz/XzA0MjIyMTQuanBn.jpg", "https://images.generated.photos/BKcd199EoM37jCZMIb18mWZEhxe1l7s-uykmwaljI5A/rs:fit:512:512/wm:0.95:sowe:18:18:0.33/Z3M6Ly9nZW5lcmF0/ZWQtcGhvdG9zL3Yz/XzA1NDQ0MzAuanBn.jpg", "https://images.generated.photos/1k3lzxgEtWeS2mefKNXprUfn-kPpzyz3QJ0xuizOQrE/rs:fit:512:512/wm:0.95:sowe:18:18:0.33/Z3M6Ly9nZW5lcmF0/ZWQtcGhvdG9zL3Yz/XzA3NzkzMDkuanBn.jpg", "https://generated.photos/face/joyfull-white-young-adult-female-with-long-brown-hair-and-blue-eyes--5e6845346d3b380006e2c17f", "https://generated.photos/face/joyfull-white-young-adult-female-with-long-brown-hair-and-green-eyes--5e68640f6d3b380006e9b6d1"];
app.get("/contact", handleContactPage);
function handleContactPage(req, res) {
  res.render("pages/contact");
}
app.post("/contact", handleContactUsForm);
function handleContactUsForm(req, res) {
  let SQL = `INSERT INTO contact (mess,user_id) VALUES ($1,$2);`
  let safeValue = [req.body.text, req.params.id];
  client.query(SQL, safeValue).then(() => {
    res.render('index');
  }).catch(error => {
    res.render("pages/error", { error: error });
  })
}

// ==============[SALAH] login =====================


// _______________________________________________________________________Edit profile 

app.put('/update/:id', (req, res) => {

  let edit = req.body;
  let SQL = 'UPDATE users SET full_name=$1,status=$2,type_of_work=$3,email=$4 ,username=$5,password=$6,phone_num=$7,exp=$8 WHERE id=$9;';
  let safeValues = [
    edit.full_name,
    edit.status,
    edit.type_of_work,
    edit.email,
    edit.user_name,
    edit.password,
    edit.phone_num,
    edit.exp,
    req.params.id
  ]
  client.query(SQL, safeValues)
    .then(res.redirect(`/login/acconut/${req.params.id}?is_not_enable=${false}`))

});


// ______________________________________________________________________//
app.get('/aboutus', (req, res) => {
  res.render('pages/aboutus');


})




function saveSchedule(req,res){
  let input = req.body;
  let id = req.params.id;
  let insartQuery = 'INSERT INTO schedule (hours_avl_from,hours_avl_to,day,user_id) VALUES ($1,$2,$3,$4) RETURNING *;';
  let safeValue = [input.from,input.until,input.date, id];
  client.query(insartQuery,safeValue).then(dataSchedule =>{
    res.redirect(`/login/acconut/${req.params.id}?is_not_enable=${false}`);
  })

}
// ____________________________________________________________________________


var nodemailer = require('nodemailer');
const { search } = require('superagent');

function sendMessage(req, res) {
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'emergency.app987@gmail.com',
      pass: 'qwe asd zxc 123'
    }
  });
  var mailOptions = {
    from: 'emergency.app987@gmail.com',
    to: req.body.email,
    subject: 'Do You Want To Work With Me',
    text: req.body.message,
  };




  // ==============================home page =============================

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      res.redirect(`/login/acconut/${req.params.id}?is_not_enable=${true}#contact`)
      console.log('Email sent: ' + info.response);
    }
  });
}

app.get('/ask', renderAskPage);

function renderAskPage(req, res) {
  return searchForQue().then(data => {
    res.render('pages/ask', { data: data })
  }).catch(error => {
    console.log(error);
  });
};
app.post('/ask', searchAskPage);
function searchAskPage(req, res) {
  return searchForQue(req.body["type_of_work"], req.body.subject).then(data => {
    res.render('pages/ask', { data: data })
  }).catch(error => {
    console.log(error);
  });
};

function searchForQue(work, subject) {
  let queyStr = work & subject ? 'SELECT * from ask  INNER JOIN users ON (USERS.id = ask.user_id) where ask.type_of_work = $1 and subject = $2;' : work ? 'SELECT * from ask  INNER JOIN users ON (USERS.id = ask.user_id) where ask.type_of_work = $1 ;' : subject ? 'SELECT * from ask  INNER JOIN users ON (USERS.id = ask.user_id) where subject = $1;' : 'SELECT * from ask  INNER JOIN users ON (USERS.id = ask.user_id);';
  let safeArr = work & subject ? [work, subject] : work ? [work] : subject ? [subject] : [];
  return client.query(queyStr, safeArr).then(data => {
    return data.rows;
  })
};

app.get('/addQuestion', renderAddQuePage);
app.get('/question/:id', renderQue)

app.post('/addQue/:id', addQue);

function addQue(req, res) {
  return addQueToDB(req.body["type_of_work"], req.body.subject, req.body.que, req.params.id).then(data => {
    res.redirect(`/question/${data.id}`)
  }).catch(error => {
    console.log(error);
  });
}

function addQueToDB(work, subject, que, id) {
  return client.query('INSERT INTO Ask (type_of_work,subject,que,user_id,is_answered) values ($1,$2,$3,$4,$5) RETURNING *', [work, subject, que, id, 0]).then(data => {
    return data.rows[0];
  }).catch(error => {
    console.log(error);
  });
}

function renderQue(req, res) {
  return getfromQueDB(req.params.id).then(data => {
    res.render('pages/quePage.ejs', data);
  })
}
function renderAddQuePage(req, res) {
  res.render('pages/addNewQuestion')
};

app.post('/addAns/:id', addAnswer);


function saveAnsInDB(que_id, answer, user_id) {
  console.log(que_id, 'que_id');
  return client.query('INSERT INTO answer (user_id,que_id,answer,is_true) VALUES ($1,$2,$3,$4)', [user_id, que_id, answer, 0]).then(data => {
    return que_id;
  }).catch(error => {
    console.log(error);
  });;
};
function saveRepInDB(ans_id, mess,user_id,que_id){
  console.log(ans_id,mess,user_id,'que_id');
  return client.query('INSERT INTO reply (user_id,ans_id,mess) VALUES ($1,$2,$3)',[user_id,ans_id,mess]).then(data =>{
    return que_id;
  }).catch(error => {
    console.log(error);
  });;
};
// ________________________________________________________________________________current//

app.get('/current',(req,res)=>{
  res.render('pages/current')
})

app.post('/login', (req, res) => {
  let quer = req.body;
  var email = quer.email;
  var pass = quer.password;

  if (req.query.role) {
    let sqlForSelectAdmin = 'SELECT * FROM users WHERE role = 3;'
    client.query(sqlForSelectAdmin).then(admins => {
      if (checkIfTheAdminInDataBase(admins, email, pass)) {
        client.query("SELECT * FROM contact;").then(contactTable => {
          res.render("pages/cotactUsMessages", { object: contactTable.rows, faceImages: arrayOfImages })
        }).catch(error => {
          res.render("pages/error", { error: error });
        })
      } else {
        // give alert that "you are not admin"
      }
    }).catch(error => {
      res.render("pages/error", { error: error });
    })
  } else {
    let sql = `SELECT * FROM users WHERE email = $1 and password = $2;`;
    client.query(sql, [email, pass]).then((result) => {
      if (result.rowCount) {
        status = 'Ok'
        res.redirect(`/login/acconut/${result.rows[0].id}?is_not_enable=${false}`)
      } else {
        status = 'Wrong Email Or Password'
        res.redirect('/log_Page');
      }
    })
  }
})



function checkIfTheAdminInDataBase(admins, email, pass) {
  let checker = false;
  let ourAdmins = admins.rows;
  ourAdmins.forEach(oneAdmen => {
    if (email === oneAdmen.email && pass === oneAdmen.password) {
      checker = true;
    }
  });
  return checker;
}



// _______________________________________________________________________Edit profile 

// ____________________________________________________________________________

client.connect().then(() => {
  app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`);
  });
}).catch(e => {

  console.log(e, 'errrrrroooooorrrr');
})

function getfromQueDB(id){
  return client.query(`SELECT ask.id as id, ASK.que as que, Ask.user_id as user_id, Ask.is_answered as is_answered, Ask.subject as subject,Ask.type_of_work as type_of_work,USERS.username as username, USERS.img as img FROM ASK left outer JOIN users ON  (USERS.id = ask.user_id) WHERE ask.id = ${id};`).then(queData=>{
    return client.query('SELECT answer.id as id,answer.que_id as que_id, answer.answer as answer,answer.answer is_true,answer.user_id as user_id, USERS.username as username, USERS.img as img  FROM answer INNER JOIN users ON  (USERS.id = answer.user_id)  Where que_id = $1;',[id]).then(ansdata=>{
      return client.query('SELECT reply.id as id ,reply.ans_id as ans_id, reply.mess as mess,reply.user_id as user_id,USERS.username as username, USERS.img as img  FROM reply INNER JOIN users ON  (USERS.id = reply.user_id);').then(repData=>{
        return{queData:queData.rows[0],ansdata:ansdata.rows,repData:repData.rows}
      });
    });
  });
};

function renderAddQuePage(req,res){

  res.render('pages/addNewQuestion')
};

app.post('/addAns/:id', addAnswer);

function addAnswer(req, res) {
  return saveAnsInDB(req.params.id, req.body.answer, req.body.user_id).then(id => {
    res.redirect(`/question/${id}`)
  }).catch(error => {
    console.log(error);
  });
};
function saveAnsInDB(que_id, answer, user_id) {
  console.log(que_id, 'que_id');
  return client.query('INSERT INTO answer (user_id,que_id,answer,is_true) VALUES ($1,$2,$3,$4)', [user_id, que_id, answer, 0]).then(data => {
    return que_id;
  }).catch(error => {
    console.log(error);
  });;
};
app.post('/addReply/:id', addReply)
function addReply(req,res){
  return saveRepInDB(req.params.id,req.body.mess,req.body.user_id,req.body.que_id).then(id=>{
    res.redirect(`/question/${id}`)
  }).catch(error => {
    console.log(error);
  });
};

function saveRepInDB(ans_id, mess,user_id,que_id){
  console.log(ans_id,mess,user_id,'que_id');
  return client.query('INSERT INTO reply (user_id,ans_id,mess) VALUES ($1,$2,$3)',[user_id,ans_id,mess]).then(data =>{
    return que_id;
  }).catch(error => {
    console.log(error);
  });;
};