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
let locData = [];
let status ='Ok';
const pg = require('pg');
// const client = new pg.Client({ connectionString: process.env.DATABASE_URL,   ssl: { rejectUnauthorized: false } });
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

// ===================================================== Map ========================================================
app.get('/map', laodMapPage);

app.post('/map', getUsersLocations);

function getUsersLocations(req, res) {
  return getAllLocationsFromDB(req.body.work, req.body.experience).then(data => {
    locData = data;
    res.redirect('/map');
  }).catch(error => {
    console.log(error);
  })
};
function getAllLocationsFromDB(work, experience) {
  // let day = new Date().getDay();
  // let today = new Date();
  experience = experience || 0;
  console.log(work, 'work')
  return client.query('SELECT * FROM USERS left outer join schedule ON (USERS.id = schedule.user_id) WHERE type_of_work = $1 and exp >= $2', [work, experience]).then(data => {
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
  res.render('pages/map', { data: locData });
};
// ======================= Acconut page geting from database=====================
app.get('/login/acconut/:id', handleAcconutPage);
function handleAcconutPage(req, res) {
  let id = req.params.id;
  console.log(id);
  let selectFromDB = 'SELECT * FROM user WHERE id=$1;';

  //   console.log('DB',selectFromDB);
  let safeValue = [id];
  client.query(selectFromDB, safeValue).then(data => {
    res.render('pages/accountNew', { data: data.rows[0] });
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
      res.redirect(`/login/acconut/${result.rows[0].id}`)
    }else{
      status = 'Wrong Email Or Password'
      res.redirect('/log_Page');
    }
  })
})


    res.render('pages/error', { data: data.rows[0] });

  }).catch(error => {
    console.log('you have error' + error)
  })



})

// ======================= Contact Us Page =====================
app.get("/contact", handleContactPage);
function handleContactPage(req, res) {
  res.render("pages/contact")
}
app.post("/contact", handleContactUsForm);
function handleContactUsForm(req, res) {
  let userName = req.body.userName;
  let email = req.body.email;
  // let text = req.body.text;
  let selectSql = "SELECT username, email FROM users;";
  client.query(selectSql).then(table => {
    table.rows.forEach(oneUser => {
      if (oneUser.username === userName && oneUser.email === email) {

        let SQL = `INSERT INTO contact (mess) VALUES ($1);`
        let safeValue = [req.body.text];
        client.query(SQL, safeValue)
          .then(() => {
            res.render("index")
          }).catch(error => {
            res.render("pages/error", { error: error });
          })
      }
    });

  }).catch(error => {
    res.render("pages/error", { error: error });
  })
}

// {{{{{}}}}}____________________________
// const client = new pg.Client({ connectionString: process.env.DATABASE_URL, });
// const client = new pg.Client({ connectionString: process.env.DATABASE_URL,   ssl: { rejectUnauthorized: false } });
// const methodOverride = require('method-override');
// app.use(methodOverride('_method'));
// const port = process.env.PORT || 3000;


// function handelError(res, error) {
//   res.render('pages/error', { error: error });
// }

//     }).catch(error=>{
//         console.log('you have error'+error)
//     })
// })

client.connect().then(() => {
  app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`);
  });
}).catch(e => {

  console.log(e, 'errrrrroooooorrrr');
});
