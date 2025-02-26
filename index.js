require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const db = require('./config/dbconn.js');

const { cus_register, cus_login, cus_forgot, emp_login, emp_forgot } = require('./controllers/auth.js');
const { cus_auth, emp_auth }  = require('./middleware/auth');
const { emp_edit, emp_create, emp_delete, emp_editProfile }  = require('./controllers/emp.js');
// const { readdirSync } = require('fs');

// use, set
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static('public'));
app.set('view engine', 'ejs');


//customer
app.post('/api/process_register', cus_register);
app.post('/api/process_login', cus_login);
app.post('/api/cus_forgot', cus_forgot);

//enployee
app.post('/api/emp_login', emp_login);
app.post('/api/emp_forgot', emp_forgot);
app.post('/api/emp_edituser', emp_edit);
app.post('/api/emp_createuser', emp_create);
app.post('/api/emp_deleteuser', emp_delete);
app.post('/api/emp_editProfile', emp_editProfile);

// middleware
// require('./middleware/auth.js');
app.get('/protected-route', cus_auth, (req, res) => {
    console.log(req.isUser);
    res.send("This is a protected area.");
});
// readdirSync('./routes').map((r) => app.use('/auth', require('./routes/'+ r)));

app.get('/emp/home', emp_auth, (req, res) => {
    const userData = req.emp;
    // console.log("user: ", userData && userData.role);

    if (userData && userData.role) {
        const sql = 'SELECT * FROM employees';
        db.all(sql, (err, rows) => {
            if (err) {
                console.log(err.message);
                return res.status(500).send("Failed to retrieve data.");
            }
            res.render('emp/layout', { body: 'home', data: rows, user: userData });
        });
    } else {
        return res.sendFile(path.join(__dirname, '/public/error404.html'));
    }
});

app.get('/emp/orders', emp_auth, (req, res) => {
    const userData = req.emp;
    // console.log("user: ", userData && userData.role);

    if (userData && userData.role) {
        const sql = 'SELECT * FROM employees';
        db.all(sql, (err, rows) => {
            if (err) {
                console.log(err.message);
                return res.status(500).send("Failed to retrieve data.");
            }
            res.render('emp/layout', { body: 'orders', data: rows, user: userData });
        });
    } else {
        return res.sendFile(path.join(__dirname, '/public/error404.html'));
    }
});

app.get('/emp/myorders', emp_auth, (req, res) => {
    const userData = req.emp;
    // console.log("user: ", userData && userData.role);

    if (userData && userData.role) {
        const sql = 'SELECT * FROM employees';
        db.all(sql, (err, rows) => {
            if (err) {
                console.log(err.message);
                return res.status(500).send("Failed to retrieve data.");
            }
            res.render('emp/layout', { body: 'myorders', data: rows, user: userData });
        });
    } else {
        return res.sendFile(path.join(__dirname, '/public/error404.html'));
    }
});

app.get('/emp/products', emp_auth, (req, res) => {
    const userData = req.emp;
    // console.log("user: ", userData && userData.role);

    if (userData && userData.role) {
        const sql = 'SELECT * FROM employees';
        db.all(sql, (err, rows) => {
            if (err) {
                console.log(err.message);
                return res.status(500).send("Failed to retrieve data.");
            }
            res.render('emp/layout', { body: 'products', data: rows, user: userData });
        });
    } else {
        return res.sendFile(path.join(__dirname, '/public/error404.html'));
    }
});

app.get('/emp/manages', emp_auth, (req, res) => {
    const userData = req.emp;
    const searchTerm = req.query.search;
    if (userData && userData.role) {
        if (!searchTerm) {
            const sql = 'SELECT * FROM employees WHERE email != ?';
            db.all(sql, [userData.email], (err, rows) => {
                if (err) {
                    console.log(err.message);
                    return res.status(500).send("Failed to retrieve data.");
                }
                res.render('emp/layout', { body: 'manages', data: rows, user: userData, notFound: false });
            });
        } else {
            let sql2 = 'SELECT * FROM employees WHERE (fname LIKE ? OR email LIKE ? OR role LIKE ?) AND email != ?';
            db.all(sql2, [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, userData.email], (err, results) => {
                if (err) {
                    console.log(err.message);
                    return res.status(500).send("Error in search operation.");
                }
                if (results.length === 0) {
                    return res.render('emp/layout', { body: 'manages', data: results, user: userData, notFound: true });
                }
                res.render('emp/layout', { body: 'manages', data: results, user: userData, notFound: false });
            });
        }
    }else {
        return res.sendFile(path.join(__dirname, '/public/error404.html'));
    }
});



app.get('/emp/edit', emp_auth, function (req, res) {
    const userData = req.emp;
    if (userData && userData.role) {
        const sql = `SELECT * FROM employees WHERE id=${req.query.id};`;
        db.all(sql, (err, rows) => {
            if (err) {
                console.log(err.message);
                return res.status(500).send("Failed to retrieve data.");
            }
            // res.render('emp/editUser', { data: rows, isEditing: true });
            res.render('emp/layout', { body: 'editUser', data: rows, user: userData, isEditing: true });
        });
    }else {
        return res.sendFile(path.join(__dirname, '/public/error404.html'));
    }
})

app.get('/emp/profile', emp_auth, function (req, res) {
    const userData = req.emp;
    if (userData && userData.role) {
        const sql = `SELECT * FROM employees WHERE id=${req.emp.id};`;
        db.all(sql, (err, rows) => {
            if (err) {
                console.log(err.message);
                return res.status(500).send("Failed to retrieve data.");
            }
            // res.render('emp/editProfile', { data: rows });
            res.render('emp/layout', { body: 'editProfile', data: rows, user: userData });
        });
    }else {
        return res.sendFile(path.join(__dirname, '/public/error404.html'));
    }
})

app.get('/emp/create', emp_auth, function (req, res) {
    const userData = req.emp;
    // console.log("role: ", req.emp)
    if (userData && userData.role) {
        let data = [{
            id: '', fname: '', lname: '', phone: '', address: '', email: ''
        }];
        // return res.render('emp/editUser', { data: data, isEditing: false });
        res.render('emp/layout', { body: 'editUser', data: data, user: userData, isEditing: false });
    }else {
        return res.sendFile(path.join(__dirname, '/public/error404.html'));
    }
    
});

app.get('/emp/detail_order', emp_auth, function (req, res) {
    const userData = req.emp;
    if (userData && userData.role) {
        res.render('emp/layout', { body: 'detailorder', user: userData });
    }else {
        return res.sendFile(path.join(__dirname, '/public/error404.html'));
    }
})


// app.get('/show', emp_auth, (req, res) => {
//     const userData = req.emp;
//     if (userData.role == 'admin') {
//         const sql = 'SELECT * FROM employees';
//         db.all(sql, (err, rows) => {
//             if (err) {
//                 console.log(err.message);
//                 return res.status(500).send("Failed to retrieve data.");
//             }
//             res.render('emp/showUser', { data: rows, user: req.emp.email });
//         });
//     }else {
//         res.send("This is a protected area.");
//     }
    
// });

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

app.get('/forgot', function (req, res) {
    res.render('customer/forgotpass');
});

//employee
app.get('/emp/login', function (req, res) {
    res.render('emp/login');
});

app.get('/emp/forgot', function (req, res) {
    res.render('emp/forgotpass');
});

app.post('/logout', (req, res) => {
    // console.log("logout");
    res.cookie('authToken', '', { maxAge: 0 });
    res.render('emp/login');
});

// app.get('/manages', (req, res) => {
//     res.render('emp/layout', { body: 'manages' });
// });

app.listen(port, () => {
    console.log(`listening to port ${port}`);
}); 