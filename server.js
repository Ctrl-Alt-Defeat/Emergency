'use strict';
const express = require('express');
const app = express();
var cors = require('cors');
require('dotenv').config();
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
let status ='Ok';
const pg = require('pg');
// const client = new pg.Client({ connectionString: process.env.DATABASE_URL,   ssl: { rejectUnauthorized: false } });
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

// ===================================================== Map ========================================================
app.get('/map', laodMapPage);

app.post('/map', getUsersLocations);

function getUsersLocations(req, res) {
  return getAllLocationsFromDB(req.body.work, req.body.experience).then(data => {
    res.send(data);
  }).catch(error => {
    console.log(error);
  })
};
function getAllLocationsFromDB(work, experience) {
  let selectQuery = 'SELECT * FROM USERS left outer join schedule ON (USERS.id = schedule.user_id) WHERE type_of_work = $2 and exp >= $1 and role = 1';
  experience = experience || 0;
  let safeArr = [experience,work]
  if(work == 'All'){
    selectQuery = 'SELECT * FROM USERS left outer join schedule ON (USERS.id = schedule.user_id) WHERE exp >= $1 and role = 1'
    safeArr = [experience]
  };
  return client.query(selectQuery , safeArr).then(data => {
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
  console.log(id);
  let selectFromDB = 'SELECT * FROM users WHERE id=$1;';
  //   console.log('DB',selectFromDB);
  let safeValue = [id];
  client.query(selectFromDB, safeValue).then(data => {
    res.render('pages/accountNew', { data: data.rows[0],is_enable: req.query.is_not_enable});
    console.log(data.rows[0]);
  }).catch(error => {
    console.log(`an error occurred while getting task with ID number ${id} from DB ${error}`);
  });
}

// {{{{{login}}}}}________________________
app.get('/log_Page', (req, res) => {
  let oldStatus = status;
  status  = 'Ok';
  res.render('pages/login',{status:oldStatus});
})

app.post('/login', (req, res) => {
  let quer = req.body;
  var email = quer.email;
  var pass = quer.password;
  let sql = `SELECT * FROM users WHERE email = $1 and password = $2;`;
  client.query(sql,[email,pass]).then((result) => {
    if(result.rowCount){
      status = 'Ok'
      res.redirect(`/login/acconut/${result.rows[0].id}?is_not_enable=${false}`)
    }else{
      status = 'Wrong Email Or Password'
      res.redirect('/log_Page');
    }
  })
})



client.connect().then(() => {
  app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`);
  });
}).catch(e => {

  console.log(e, 'errrrrroooooorrrr');
});
