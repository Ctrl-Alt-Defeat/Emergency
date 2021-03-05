'use strict';
const express = require('express');
const app = express();
var cors = require('cors');
require('dotenv').config();
app.use(cors());
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
const methodOverride = require('method-override');
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(methodOverride('_method'));
const port = process.env.PORT || 3000;
const superagent = require('superagent');
let locData = []
const pg = require('pg');
// const client = new pg.Client({ connectionString: process.env.DATABASE_URL,   ssl: { rejectUnauthorized: false } });
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

// ===================================================== Map ========================================================
app.get('/map', laodMapPage);

app.post('/map',getUsersLocations);

function getUsersLocations(req,res){
  return getAllLocationsFromDB(req.body.work,req.body.experience).then(data=>{
    locData = data;
    res.redirect('/map');
  }).catch(error=>{
    console.log(error);
  })
};
function getAllLocationsFromDB(work,experience){
  // let day = new Date().getDay();
  // let today = new Date();
  experience = experience || 0;  
  console.log(work,'work')
  return client.query('SELECT * FROM USERS left outer join schedule ON (USERS.id = schedule.user_id) WHERE type_of_work = $1 and exp >= $2',[work,experience]).then(data=>{
      return data.rows
  }).catch(error=>{
    console.log(error)
  });
}
// ===================================================================================================================



function handelError(res, error) {
    res.render('pages/error', { error: error });
};

function laodMapPage(req,res){
    res.render('pages/map',{data:locData});
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
    res.render('pages/accountNew', { data: data.rows[0] });
    console.log(data.rows[0]);
  }).catch(error =>{
    console.log(`an error occurred while getting task with ID number ${id} from DB ${error}`);
  });
}

// {{{{{login}}}}}________________________
app.get('/',(req,res)=>{
    res.render('pages/login')
})

app.post('/loginn',(req,res)=>{
    let quer=req.body ;
    let SQL = 'SELECT * FROM users WHERE email = $1 and password = $2 ;' ;
    let safevalue =[quer.username,quer.password];
   
    client.query(SQL,safevalue).then(data=>{
        
        res.render('pages/error',{data:data.rows[0]});

    }).catch(error=>{
        console.log('you have error'+error)
    })
})

client.connect().then(() => {
  app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`);
  });
}).catch(e => {

    console.log(e, 'errrrrroooooorrrr');
});
