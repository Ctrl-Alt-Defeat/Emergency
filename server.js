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
app.get('/', home);

function home(req,res){
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
  let selectQuery = 'SELECT * FROM USERS left outer join schedule ON (USERS.id = schedule.user_id) WHERE type_of_work = $2 and exp >= $1 and role = 1';
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
  // console.log(req);
  let safeValue = [id];
  return client.query(selectFromDB, safeValue).then(data => {
    let accountDB = data.rows[0];
    let allData = new AccountDB(accountDB.full_name, accountDB.role, accountDB.location, accountDB.img, accountDB.type_of_work, accountDB.email, accountDB.phone_num, accountDB.status, accountDB.exp, accountDB.username);

    let selectFromFeedbacksDB = 'SELECT * FROM feedback INNER JOIN users ON (USERS.id = feedback.owner_id) WHERE user_id = $1;';
    return client.query(selectFromFeedbacksDB, safeValue).then(dataFeedbacks => {
      res.render('pages/accountNew', { data: data.rows[0], is_not_enable: req.query.is_not_enable, dataFeedbacks: dataFeedbacks.rows });
    }).catch(error => {
      console.log(`an error occurred while getting task with ID number ${id} from DB ${error}`);
    })
  }).catch(error => {
    console.log(`an error occurred while getting task with ID number ${id} from DB ${error}`);
  });
}

function AccountDB(full_name, role, location, img, type_of_work, email, phone_num, status, exp, username) {
  this.name = full_name;
  this.role = role;
  this.location = location;
  this.image = img;
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
    console.log(data.rows[0]);
    res.redirect(`/login/acconut/${data.rows[0].id}?is_not_enable=${false}`);
  }).catch(error => {
    res.status(500).send(`Sorry an error has accord while loading the page  ${error} `);
  });
});

//====================================================================================

// ==============[SALAH] Contact Us Page And Getting All Messages to another page =====================
app.get("/contact", handleContactPage);
function handleContactPage(req, res) {
  res.render("pages/contact");
}
app.post("/contact", handleContactUsForm);
function handleContactUsForm(req, res) {
  console.log(req.params.id)
  let SQL = `INSERT INTO contact (mess,user_id) VALUES ($1,$2);`
  let safeValue = [req.body.text, req.params.id];
  client.query(SQL, safeValue).then(() => {

    client.query("SELECT * FROM contact;").then(contactTable => {
      res.render("pages/cotactUsMessages", { object: contactTable.rows })
    }).catch(error => {
      res.render("pages/error", { error: error });
    })
  }).catch(error => {
    res.render("pages/error", { error: error });
  })
}



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
  console.log(SQL, safeValues)
  client.query(SQL, safeValues)
    .then(res.redirect(`/login/acconut/${req.params.id}?is_not_enable=${false}`))

});


// ______________________________________________________________________//
app.get('/aboutus',(req,res)=>{
  res.render('pages/aboutus');


})

// ____________________________________________________________________________

client.connect().then(() => {
  app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`);
  });
}).catch(e => {

  console.log(e, 'errrrrroooooorrrr');
});


var nodemailer = require('nodemailer');

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

