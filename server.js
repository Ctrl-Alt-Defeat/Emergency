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
// ===================================================== Map ========================================================
app.get('/map', laodMapPage);
app.post('/map', getUsersLocations);
app.post('/message/:id', sendMessage);

function getUsersLocations(req, res) {
  return getAllLocationsFromDB(req.body.work, req.body.experience).then(data => {
    console.log(data, 'data');
    res.send(data);
  }).catch(error => {
    console.log(error);
  })
};
function getAllLocationsFromDB(work, experience) {
  let selectQuery = 'SELECT * FROM USERS left outer join schedule ON (USERS.id = schedule.user_id) WHERE ask.type_of_work = $2 and exp >= $1 and role = 1';
  experience = experience || 0;
  let safeArr = [experience, work]
  if (work == 'All') {
    selectQuery = 'SELECT * FROM USERS left outer join schedule ON (USERS.id = schedule.user_id) WHERE exp >= $1 and role = 1'
    safeArr = [experience]
  };
  return client.query(selectQuery, safeArr).then(data => {
    return data.rows
  }).catch(error => {
    console.log(error)
  });
}

// ===================================================================================================================

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
    let selectFromFeedbacksDB = 'SELECT * FROM feedback INNER JOIN users ON (USERS.id = feedback.owner_id) WHERE user_id = $1;';
    return client.query(selectFromFeedbacksDB, safeValue).then(dataFeedbacks => {
      res.render('pages/accountNew', { data: data.rows[0],is_not_enable: req.query.is_not_enable,dataFeedbacks:dataFeedbacks.rows});
    }).catch(error=>{
      console.log(`an error occurred while getting task with ID number ${id} from DB ${error}`);
    })
  }).catch(error => {
    console.log(`an error occurred while getting task with ID number ${id} from DB ${error}`);
  });
}

// {{{{{login}}}}}________________________
app.get('/log_Page', (req, res) => {
  let oldStatus = status;
  status = 'Ok';
  res.render('pages/login', { status: oldStatus });
})

app.post('/login', (req, res) => {
  let quer = req.body;
  var email = quer.email;
  var pass = quer.password;
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
})


//===========================Sign up==================================

app.post('/signUp', (req, res) => {
  let body = req.body;
  let full_name = body.full_name;
  let role = body.role;
  let location = body.location;
  let typeOfwork = body.type_of_work;
  let email = body.email;
  let userName = body.user_name;
  let password = body.password;
  let phoneNum = body.phone_num;
  let status = body.status;

  let insertQuery = 'INSERT INTO users (full_name,role,location,type_of_work,email,password,phone_num,username,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *;'

  let safeValue = [full_name, role, location, typeOfwork, email, password, phoneNum, userName,status];


  client.query(insertQuery, safeValue).then(data => {
    console.log(data.rows[0]);
    res.redirect(`/login/acconut/${data.rows[0].id}?is_not_enable=${false}`);
  }).catch(error => {
    res.status(500).send(`Sorry an error has accord while loading the page  ${error} `);
  });
});

//====================================================================================

// ======================= Contact Us Page =====================
app.get("/contact", handleContactPage);
function handleContactPage(req, res) {
  res.render("pages/contact")
}
app.post("/contact/:id", handleContactUsForm);
function handleContactUsForm(req, res) {
      console.log(req.params.id)
        let SQL = `INSERT INTO contact (mess,user_id) VALUES ($1,$2);`
        let safeValue = [req.body.text, req.params.id];
        client.query(SQL, safeValue).then(() => {
          res.render("/contact")
        }).catch(error => {
          res.render("pages/error", { error: error });
        })
}

client.connect().then(() => {
  app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`);
  });
}).catch(e => {

  console.log(e, 'errrrrroooooorrrr');
});


var nodemailer = require('nodemailer');
const { search } = require('superagent');

function sendMessage(req, res) {
  console.log(req.body);
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

function renderAskPage(req,res){
  return searchForQue().then(data =>{
    res.render('pages/ask',{data:data})
  }).catch(error=>{
    console.log(error);
  });
};
app.post('/ask', searchAskPage);
function searchAskPage(req,res){
  return searchForQue(req.body["type_of_work"],req.body.subject).then(data =>{
    res.render('pages/ask',{data:data})
  }).catch(error=>{
    console.log(error);
  });
};

function searchForQue(work,subject){
  let queyStr = work & subject ? 'SELECT * from ask  INNER JOIN users ON (USERS.id = ask.user_id) where ask.type_of_work = $1 and subject = $2;': work ? 'SELECT * from ask  INNER JOIN users ON (USERS.id = ask.user_id) where ask.type_of_work = $1 ;': subject ? 'SELECT * from ask  INNER JOIN users ON (USERS.id = ask.user_id) where subject = $1;':'SELECT * from ask  INNER JOIN users ON (USERS.id = ask.user_id);';
  let safeArr =  work & subject ? [work,subject]: work ? [work]: subject ? [subject]: [];
  return client.query(queyStr,safeArr).then(data=>{
    return data.rows;
  })
};

