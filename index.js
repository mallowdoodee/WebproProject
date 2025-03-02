require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
// const Swal = require('sweetalert2');


const db = require('./config/dbconn.js');

const { cus_register, cus_login, cus_forgot, emp_login, emp_forgot } = require('./controllers/auth.js');
const { cus_auth, emp_auth }  = require('./middleware/auth');
const { emp_edit, emp_create, emp_delete, emp_editProfile }  = require('./controllers/emp.js');
const { prod_edit, prod_delete } = require('./controllers/product.js');
const { order_from_cus } = require('./controllers/order.js');
// const { readdirSync } = require('fs');

// use, set
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
// app.use(Swal);
app.use(express.static('public'));
app.use(express.static('pic'));
app.use(express.static('assets'));
// app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');


//customer
app.post('/api/process_register', cus_register);
app.post('/api/process_login', cus_login);
app.post('/api/cus_forgot', cus_forgot);

//order
app.post('/api/add_order_from_cus', cus_auth, order_from_cus);


//enployee
app.post('/api/emp_login', emp_login);
app.post('/api/emp_forgot', emp_forgot);
app.post('/api/emp_edituser', emp_edit);
app.post('/api/emp_createuser', emp_create);
app.post('/api/emp_deleteuser', emp_delete);
app.post('/api/emp_editProfile', emp_editProfile);

//products
app.post('/api/prod_edit', prod_edit);
app.post('/api/prod_del', prod_delete);


// middleware
// require('./middleware/auth.js');
app.get('/protected-route', cus_auth, (req, res) => {
    console.log(req.isUser);
    res.send("This is a protected area.");
});
// readdirSync('./routes').map((r) => app.use('/auth', require('./routes/'+ r)));

//customer
app.get('/', cus_auth, function (req, res) {
    const userData = req.isUser;
    res.render('customer/layout-home', { body: 'home', user: userData })
});

app.get('/editAccount', cus_auth, function (req, res) {
    const userData = req.isUser;
    const sql = `SELECT * FROM customers WHERE email = ?`;
    db.all(sql, userData.email, (err, results) => {
        if (err) {
            console.log(err.message);
            return res.status(500).send("Failed to retrieve data.");
        }
        // console.log(results)
        res.render('customer/editAccount', { data: results });
    })
    // res.render('customer/editAccount');
});

app.get('/product', cus_auth, (req, res) => {
    const productQuery = `
      SELECT id, name, base_price, category 
      FROM products
      ORDER BY category;
    `;
  
    db.all(productQuery, (err, products) => {
      if (err) {
        console.error(err.message);
        return res.status(500).send('Server Error');
      }
  
      // Group products by category
      const categorizedProducts = products.reduce((acc, product) => {
        if (!acc[product.category]) {
          acc[product.category] = [];
        }
        acc[product.category].push(product);
        return acc;
      }, {});
  
      res.render('customer/product', { categorizedProducts });
    //   res.render('customer/layout-home', { body: 'product', categorizedProducts, user: userData });

    });
});

app.get('/make-yours/:id', cus_auth, function (req, res) {
    const productId = req.params.id;
  
    const productQuery = 'SELECT * FROM products WHERE id = ?;';
    const materialsQuery = 'SELECT * FROM materials;';
    const stonesQuery = 'SELECT * FROM stones;';
    const colorQuery = 'SELECT name FROM colors;';
    const pendantsQuery = 'SELECT * FROM pendants;';
  
    db.get(productQuery, [productId], (err, product) => {
      if (!product) return res.status(404).send("Product not found"); // Handle invalid ID
  
      db.all(materialsQuery, (_, materials) => {
        db.all(stonesQuery, (_, stones) => {
          db.all(colorQuery, (_, colors) => {
            db.all(pendantsQuery, (_, pendants) => { // Fetch pendants
              res.render('customer/customize', {
                product: product,
                materialsData: materials || [],
                stonesData: stones || [],
                colorData: colors || [],
                pendantsData: pendants || [] // Send pendants to the template
              });
            });
          });
        });
      });
    });
  });


//employee
app.get('/emp/home', emp_auth(['admin', 'jeweler']), (req, res) => {
    const userData = req.emp;
        const sql = 'SELECT * FROM employees';
        db.all(sql, (err, rows) => {
            if (err) {
                console.log(err.message);
                return res.status(500).send("Failed to retrieve data.");
            }
            res.render('emp/layout', { body: 'home', data: rows, user: userData });
        });
});

app.get('/emp/orders', emp_auth(['admin', 'jeweler']), (req, res) => {
    const userData = req.emp;
        // const sql = 'SELECT * FROM orders WHERE jeweler_id IS NULL';
        db.all('SELECT * FROM orders WHERE jeweler_id IS NULL', (err, rows) => {
            if (err) {
                console.log(err.message);
                return res.status(500).send("Failed to retrieve data.");
            }
            rows.forEach((user) => {
                console.log(user.customer_id)
                

            })
            res.render('emp/layout', { body: 'orders', data: rows, user: userData });
        });
});

app.get('/emp/myorders', emp_auth(['admin', 'jeweler']), (req, res) => {
    const userData = req.emp;
    // console.log(userData.id)

        const sql = `SELECT * FROM orders WHERE jeweler_id = ${userData.id}`;
        db.all(sql, (err, rows) => {
            if (err) {
                console.log(err.message);
                return res.status(500).send("Failed to retrieve data.");
            }
            // console.log(rows);
            res.render('emp/layout', { body: 'myorders', data: rows, user: userData });
        });
});

// app.get('/emp/products', emp_auth, (req, res) => {
//     const userData = req.emp;
//     // console.log("user: ", userData && userData.role);

//     if (userData && userData.role) {
//         let allProducts = [];
//         const sql_materials = 'SELECT * FROM materials';
//         db.all(sql_materials, (err, rows) => {
//             if (err) {
//                 console.log(err.message);
//                 return res.status(500).send("Failed to retrieve data.");
//             }
//             allProducts.push(rows);
//             // console.log("all: ", allProducts[0][0])
//             res.render('emp/layout', { body: 'products', allData: allProducts, user: userData });
//         });
//     } else {
//         return res.sendFile(path.join(__dirname, '/public/error404.html'));
//     }
// });

app.get('/emp/products', emp_auth(['admin', 'jeweler']), (req, res) => {
    const userData = req.emp;

        let allProducts = {};
        // const category = ['products', 'materials', 'pendants', 'stones', 'color'];
        const category = ['materials']
        const sql_materials = 'SELECT * FROM materials';
        db.all(sql_materials, (err, rows) => {
            if (err) {
                console.log(err.message);
                return res.status(500).send("Failed to retrieve data.");
            }
            allProducts[category] = rows;
            // console.log(allProducts);
            // console.log("all: ", allProducts[0][0])
            res.render('emp/layout', { body: 'products', allData: allProducts, user: userData });
        });
});

app.post('/emp/product_edit', emp_auth(['admin', 'jeweler']), (req, res) => {
    const userData = req.emp;
    const { category, id } = req.body;
    console.log("id: ", category);
        const sql = `SELECT * FROM ${category} WHERE id = ${id}`;
        db.all(sql, (err, rows) => {
            if (err) {
                return res.status(500).send("Failed to retrieve data.");
            }
            console.log(rows)
        })
})

app.get('/emp/manages', emp_auth(['admin']), (req, res) => {
    const userData = req.emp;
    const searchTerm = req.query.search;
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
});



app.get('/emp/edit', emp_auth(['admin']), function (req, res) {
    const userData = req.emp;
        const sql = `SELECT * FROM employees WHERE id=${req.query.id};`;
        db.all(sql, (err, rows) => {
            if (err) {
                console.log(err.message);
                return res.status(500).send("Failed to retrieve data.");
            }
            // res.render('emp/editUser', { data: rows, isEditing: true });
            res.render('emp/layout', { body: 'editUser', data: rows, user: userData, isEditing: true });
        });

})

app.get('/emp/profile', emp_auth(['admin', 'jeweler']), function (req, res) {
    const userData = req.emp;
        const sql = `SELECT * FROM employees WHERE id=${req.emp.id};`;
        db.all(sql, (err, rows) => {
            if (err) {
                console.log(err.message);
                return res.status(500).send("Failed to retrieve data.");
            }
            res.render('emp/layout', { body: 'editProfile', data: rows, user: userData });
        });
})

app.get('/emp/create', emp_auth(['admin']), function (req, res) {
    const userData = req.emp;
        let data = [{
            id: '', fname: '', lname: '', phone: '', address: '', email: ''
        }];
        res.render('emp/layout', { body: 'editUser', data: data, user: userData, isEditing: false });

    
});

app.get('/emp/detail_order', emp_auth(['admin', 'jeweler']), function (req, res) {
    const userData = req.emp;
    res.render('emp/layout', { body: 'detailorder', user: userData });

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

app.get('/login', function (req, res) {
    res.render('customer/login');
});

app.get('/register', function (req, res) {
    res.render('customer/register');
});

app.get('/forgot', function (req, res) {
    res.render('customer/forgotpass');
});

// app.get('/product', function (req, res) {
//     res.render('customer/product');
// });

app.get('/createProduct',  emp_auth(['admin', 'jeweler']), function (req, res) {
    const userData = req.emp;
    res.render('emp/layout', { body: 'createProduct', user: userData });
})

//employee
app.get('/emp/login', function (req, res) {
    res.render('emp/login');
});

app.get('/emp/forgot', function (req, res) {
    res.render('emp/forgotpass');
});

app.post('/logout', (req, res) => {
    res.cookie('authToken', '', { maxAge: 0 });
    res.render('emp/login');
});


app.listen(port, () => {
    console.log(`listening to port ${port}`);
}); 