require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const db = require('./config/dbconn.js');


const { cus_register, cus_login, emp_login } = require('./controllers/auth.js');
const { cus_auth, emp_auth }  = require('./middleware/auth');
// const { readdirSync } = require('fs');

// use, set
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static('public'));
app.set('view engine', 'ejs');

// login register
//customer
app.post('/api/process_register', cus_register);
app.post('/api/process_login', cus_login);

//enployee
app.post('/api/emp_login', emp_login);

// middleware
// require('./middleware/auth.js');
app.get('/protected-route', cus_auth, (req, res) => {
    console.log(req.isUser);
    res.send("This is a protected area.");
});
// readdirSync('./routes').map((r) => app.use('/auth', require('./routes/'+ r)));
app.get('/emp_route', emp_auth, (req, res) => {
    const userData = req.emp;
    if (userData.role == 'admin') {
        // const sql = 'SELECT * FROM employees';
        // db.all(sql, (err, rows) => {
        //     if (err) {
        //         console.log(err.message);
        //         return res.status(500).send("Failed to retrieve data.");
        //     }
            res.render('emp/home', { user: userData });
        // });
    }else {
        res.send("This is a protected area.");
    }
    
});

app.get('/show', emp_auth, (req, res) => {
    const userData = req.emp;
    if (userData.role == 'admin') {
        const sql = 'SELECT * FROM employees';
        db.all(sql, (err, rows) => {
            if (err) {
                console.log(err.message);
                return res.status(500).send("Failed to retrieve data.");
            }
            res.render('emp/showUser', { data: rows, user: req.emp.email });
        });
    }else {
        res.send("This is a protected area.");
    }
    
});

// routing 
//customer
app.get('/', function (req, res) {
    res.render('home');
});

app.get('/login', function (req, res) {
    res.render('customer/login');
});

app.get('/register', function (req, res) {
    res.render('customer/register');
});

//employee
app.get('/emp/login', function (req, res) {
    res.render('emp/login');
});

app.get('/emp/home', function (req, res) {
    res.render('emp/home');
});

app.get('/edit', function (req, res) {
    // console.log(req.query.id);
    const sql = `SELECT * FROM employees;`;
    db.all(sql, (err, rows) => {
        if (err) {
            console.log(err.message);
            return res.status(500).send("Failed to retrieve data.");
        }
        res.render('emp/editUser', { data: rows });
    });
})

app.listen(port, () => {
    console.log(`listening to port ${port}`);
}); 