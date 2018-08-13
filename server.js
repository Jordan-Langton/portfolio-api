const express = require('express');
const bodyParser = require('body-parser');
const lib = require('./lib/functions.js');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const mysql = require('mysql');
const fs = require('fs');
const Hogan = require('hogan.js');
const mailer = require('@sendgrid/mail');

// inviromental vars
const PORT = process.env.PORT;


const mail = require('./lib/key/mail.js');
const sendgrid = require('./lib/key/sendgrid.js');

// init connection to server
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "portfolio"
});

// compile mail templates
let template = fs.readFileSync('./templates/mail.html', 'utf-8');
let compiledTemp = Hogan.compile(template);

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('running');
})

app.post('/signin', (req, res) => {
  const { email, password } = req.body;

  // query string
  const sql = `SELECT * FROM users WHERE users_email = ${mysql.escape(email)}`;

  // connect to DB
  db.connect(function(err) {
    if (err) {
      console.log('failed')
    };
    console.log("Connected!");
  });

  // check if cridentials are correct
  db.query(sql, (err,rows) => {
    // query failed
    if(err) {
      console.log(err);
      res.status(400).json(rows);
    }else {
      // logged in user
      res.status(200).json(rows);
      console.log('Data received from Db:\n');
      console.log(rows);
    }
  });
})

app.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  const hash = bcrypt.hashSync(password);
  let date = '2018-06-18';

  const user = {
    users_name: `${name}`,
    users_email: `${email}`,
    users_password: `${hash}`,
    users_joined: `${date}`
  };

  // query string
  const sql1 = 'INSERT INTO users SET ?';
  const sql2 = 'SELECT * FROM users';

  // query
  db.query(sql2, function(err, rows){
    // init
    let failed = false;

    // check if user already exists
    for (let i = 0; i<rows.length; i++) {
      let name = rows[i].users_name;
      let email = rows[i].users_email;

      if (user.users_name === name || user.users_name === email) {
        failed = true;
      }
    }

    // if user doesn't exists
    if (failed === false) {
      // query
      db.query(sql1, user, function(err, rows){
        // query failed
        if(err) {
          throw err;
          console.log('Failed to create user');
          res.status(400).json(rows);
        }else {
          // logged in user
          res.status(200).json('success');
          console.log('User was created Created');
        }
      });
    }else {
      console.log('User already exists');
      res.status(400).json('failed');
    }
  });
})

app.post('/send', (req, res) => {

  let user = {
    Name: req.body.name,
    Email: req.body.email,
    enquiry: req.body.userEnquiry
  };

  if (user.Name === '' || user.Email === '' || user.enquiry === '') {
    console.log('Failed');
    res.status(400).json(err);
  }else {
    // send enquiry email
    mailer.setApiKey(sendgrid[0].apiKey);
    const msg = {
      to: 'jglangton4@gmail.com',
      from: req.body.email,
      subject: 'Enquiry From Portfolio',
      html: compiledTemp.render(user)
    };

    // send mail
    mailer.send(msg, (err, result) => {
      if (err) {
        throw err;
        console.log('Failed');
        res.status(400).json(err);
      };
      console.log('success');
      res.status(200).json('success');
    });
  }
})

app.listen(5000, (err) => {
  if (err) {console.log(err)};
  console.log('Server running on port:5000');
})

/*  <-- END POINTS -->
    /           --> res = this is working
    /signin     --> POST = success/fail
    /register   --> POST = user
    /send       --> POST = success/fail
*/
