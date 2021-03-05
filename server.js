'use strict';
const express = require('express');
const app = express();
var cors = require('cors');
require('dotenv').config();
app.use(cors());
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
const superagent = require('superagent');
const pg = require('pg');
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, });
// const client = new pg.Client({ connectionString: process.env.DATABASE_URL,   ssl: { rejectUnauthorized: false } });
const methodOverride = require('method-override');
app.use(methodOverride('_method'));
const port = process.env.PORT || 3000;

// ======================= Acconut page geting from database=====================
app.get('/login/acconut/:id', handleAcconutPage);
function handleAcconutPage(req, res) {
  let id = req.params.id;
  console.log(id);
  let selectFromDB = 'SELECT * FROM users WHERE id=$1;';
//   console.log('DB',selectFromDB);
  let safeValue = [id];
  client.query(selectFromDB, safeValue).then(data => {
    res.render('pages/acconut', { data: data.rows[0] });
    console.log(data.rows[0]);
  }).catch(error =>{
    console.log(`an error occurred while getting task with ID number ${id} from DB ${error}`);
  });

}
// function handelError(res, error) {
//   res.render('pages/error', { error: error });
// }

client.connect().then(() => {
  app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`);
  });
}).catch(e => {
  console.log(e, 'errrrrroooooorrrr');
});
