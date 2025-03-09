require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
// const Swal = require('sweetalert2');
const session = require("express-session");
const multer = require("multer");


const db = require('./config/dbconn.js');

const { cus_register, cus_login, cus_forgot, cus_changeinfo, emp_login, emp_forgot } = require('./controllers/auth.js');
const { cus_auth, emp_auth, optional_cus_auth }  = require('./middleware/auth');
const { emp_edit, emp_create, emp_delete, emp_editProfile }  = require('./controllers/emp.js');
const { prod_edit, prod_delete, prod_create } = require('./controllers/product.js');
const { order_from_cus, save_order, save_editOrder, cancel_order, update_order_from_cus, accept_order, payment_check, decline_order, delivery, success_order } = require('./controllers/order.js');
// const { readdirSync } = require('fs');

// use, set
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// app.use(Swal);
app.use(express.static('public'));
app.use(express.static('pic'));
app.use(express.static('assets'));
app.use(express.static('uploads'));
// app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');


//customer
app.post('/api/process_register', cus_register);
app.post('/api/process_login', cus_login);
app.post('/api/cus_forgot', cus_forgot);
app.post('/api/cus_change_info', cus_changeinfo);


//order
app.post('/api/add_order_from_cus', cus_auth, order_from_cus);//สั่ง
app.post('/api/saveOrder', cus_auth, save_order);//save insert
app.post('/api/update_order_from_cus', cus_auth, update_order_from_cus);//สั่ง
app.post('/api/save_editOrder', cus_auth, save_editOrder);
app.post('/api/cancel_order', cus_auth, cancel_order);
app.post('/api/delivery', cus_auth, delivery);
app.post('/api/success_order', cus_auth, success_order);





app.post('/api/accept_order', emp_auth(['admin', 'jeweler']), accept_order);
app.post('/api/payment_check', emp_auth(['admin', 'jeweler']), payment_check);
app.post('/api/decline_order', emp_auth(['admin', 'jeweler']), decline_order);

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
app.post('/api/create_product', prod_create);


// middleware
// require('./middleware/auth.js');
app.get('/protected-route', cus_auth, (req, res) => {
    console.log(req.isUser);
    res.send("This is a protected area.");
});
// readdirSync('./routes').map((r) => app.use('/auth', require('./routes/'+ r)));

//customer
app.get('/', optional_cus_auth, function (req, res) {
    const userData = req.isUser;
    const sql = `SELECT * FROM products LIMIT 8`;
    db.all(sql, function(err, rows) {
        if (err) {
            console.log(err.message);
            return res.status(500).send("Failed to retrieve data.");
        }
        console.log(rows);
        res.render('customer/layout-home', { body: 'home', data: rows, user: userData })
    })
});

// app.get('/profile', cus_auth, function (req, res) {
//     const userData = req.isUser;
//     const sql = `SELECT * FROM customers WHERE email = ?`;
//     db.all(sql, userData.email, (err, results) => {
//         if (err) {
//             console.log(err.message);
//             return res.status(500).send("Failed to retrieve data.");
//         }
//         // console.log(results)
//         res.render('customer/editAccount', { data: results, user: userData });
//         // res.render('customer/layout-home', { body: 'editAccount', data: results, user: userData });
//     })
//     // res.render('customer/editAccount');
// });

// app.get('/profile', cus_auth, (req, res) => {
//     const userDa
//     res.render('customer/editAccount')
// })

app.get('/product', optional_cus_auth, (req, res) => {
    const userData = req.isUser;
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
  
      res.render('customer/product', { categorizedProducts, user: userData });
    //   res.render('customer/layout-prod', { body: 'product', categorizedProducts, user: userData });

    });
});

app.get('/make-yours/:id', optional_cus_auth, function (req, res) {
    const userData = req.isUser;
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
                // console.log("product.pendant: ", product.pendant)
              res.render('customer/customize', {
                product: product,
                user: userData,
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

app.get('/editOrder/', cus_auth, (req, res) => {
    const userData = req.isUser;
    const orderId = req.query.id;

    const orderQuery = 'SELECT * FROM orders WHERE id = ?;';
    const materialsQuery = 'SELECT * FROM materials;';
    const stonesQuery = 'SELECT * FROM stones;';
    const pendantsQuery = 'SELECT * FROM pendants;';
  
    db.get(orderQuery, [orderId], (err, order) => {
      if (!order) return res.status(404).send("Product not found")
  
      db.all(materialsQuery, (_, materials) => {
        db.all(stonesQuery, (_, stones) => {
            db.all(pendantsQuery, (_, pendants) => {
                parsedOrder = JSON.parse(order.order_detail || '{}');
                // console.log("order: ", parsedOrder)
                // console.log("materials: ", materials)
                // console.log("stones: ", stones)
                // console.log("pendants: ", pendants)
                // req.session.orderId = order.id;
                // console.log(order.id)
              res.render('customer/editOrder', {
                // body: 'editOrder',
                user: userData,
                order: order,
                order_detail: parsedOrder,
                materialsData: materials || [],
                stonesData: stones || [],
                pendantsData: pendants || []
              });
            });
          });
      });
    });

});

app.get('/myorders', cus_auth, (req, res) => {
    const userData = req.isUser;
    const page = req.query.page || "";
    let sql = ``;
    if (page === "") {
        sql = `SELECT * FROM customers WHERE id = ${userData.id}`;
    }
    else if (page === 'wait') {
        sql = `SELECT * FROM orders WHERE customer_id = ${userData.id} and order_status = 'แก้ไขต่อ'`;
    }
    else if (page === 'pending') {
        sql = `SELECT * FROM orders WHERE customer_id = ${userData.id} and order_status = 'รอดำเนินการ'`;
    }
    else if (page === 'check') {
        sql = `SELECT * FROM orders WHERE customer_id = ${userData.id} and order_status = 'รอตรวจสอบการชำระเงิน' or order_status = 'แก้ไขออเดอร์แล้วรอตรวจสอบ'`;
    }
    else if (page === 'accept') {
        sql = `SELECT * FROM orders WHERE customer_id = ${userData.id} and order_status = 'ยอมรับออเดอร์แล้ว'`;
    }
    else if (page === 'decline') {
        sql = `SELECT * FROM orders WHERE customer_id = ${userData.id} and order_status = 'ปฏิเสธการรับออเดอร์'`;
    }
    else if (page === 'paid') {
        sql = `SELECT * FROM orders WHERE customer_id = ${userData.id} and order_status = 'รับออเดอร์' or order_status = 'กำลังจัดส่ง'`;
    }
    else if (page === 'success') {
        sql = `SELECT * FROM orders WHERE customer_id = ${userData.id} and order_status = 'จัดส่งสำเร็จ'`;
    }
    db.all(sql, function (err, rows) {
        // console.log("hello")
        if(err) {
            console.error(err.message);
            return res.status(500).send("Failed to retrieve data.");
        }
        // console.log(rows)
        res.render('customer/layout-home', { body: 'myorder', user: userData, page, data: rows });
    }) 
})

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, "").slice(0, 14);
        const newFilename = `receipt_${timestamp}${path.extname(file.originalname)}`;
        cb(null, newFilename);
    },
});

const upload = multer({ storage: storage });

app.get('/ordering', cus_auth, (req, res) => {
    const userData = req.isUser;
    const orderId = req.query.id;
    const sql = `SELECT * FROM orders WHERE id = ${orderId}`;
    db.all(sql, (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send("Failed to retrieve data.");
        }

        let parsedOrder = {};
        let parsedOrder_add = { add_order: [], add_total: 0 };
    
        try {
            parsedOrder = JSON.parse(rows[0].order_detail || '{}');
            parsedOrder_add = JSON.parse(rows[0].add_order || '{}');
        } catch (parseError) {
            console.log("JSON Parsing Error:", parseError.message);
        }
        // req.session.orderId = orderId;
        console.log(parsedOrder)
        res.render('customer/layout-home', { body: 'ordering', data: rows, add: parsedOrder_add, order: parsedOrder, user: userData });
    });
});

app.post('/upload', upload.single('image'), (req, res) => {
    let id = req.body.id;
    // console.log('yess: ', id)
    
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'กรุณาอัปโหลดไฟล์' });
    }

    const filePath = req.file.filename;

    db.run(`UPDATE orders SET payment_image = ?, order_status = 'รอตรวจสอบการชำระเงิน', updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [filePath, id], (err) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
        }
        res.json({ success: true, message: 'อัปโหลดสำเร็จ!', id });
    });
});


//employee

app.get('/emp/orders', emp_auth(['admin', 'jeweler']), (req, res) => {
    const userData = req.emp;
        const sql = `SELECT * FROM orders WHERE jeweler_id IS NULL AND order_status = 'รอดำเนินการ'`;
        db.all(sql, (err, rows) => {
            if (err) {
                console.log(err.message);
                return res.status(500).send("Failed to retrieve data.");
            }
            // rows.forEach((user) => {
            //     console.log(user.customer_id)
                

            // })
            console.log(rows)
            res.render('emp/layout', { body: 'orders', data: rows, user: userData });
        });
});

app.get('/emp/myorders', emp_auth(['admin', 'jeweler']), (req, res) => {
    const userData = req.emp;
        const sql = `SELECT * FROM orders WHERE jeweler_id = ${userData.id} AND order_status != 'จัดส่งสำเร็จ'
            ORDER BY created_at`;
        db.all(sql, (err, rows) => {
            if (err) {
                console.log(err.message);
                return res.status(500).send("Failed to retrieve data.");
            }
            // req.session.orderIds = rows.map(order => order.id);
            res.render('emp/layout', { body: 'myorders', data: rows, user: userData });
        });
});

app.get('/emp/myorders_detail', emp_auth(['admin', 'jeweler']), (req, res) => {
    const userData = req.emp;
        const sql = `SELECT * FROM orders WHERE id=${req.query.id};`;
        db.all(sql, (err, rows) => {
            if (err) {
                console.log(err.message);
                return res.status(500).send("Failed to retrieve data.");
            }
        
            // req.session.orderId = rows[0].id;
        
            let parsedOrder = {};
            let parsedOrder_add = { add_order: [], add_total: 0 };
        
            try {
                parsedOrder = JSON.parse(rows[0].order_detail || '{}');
                parsedOrder_add = JSON.parse(rows[0].add_order || '{}');
            } catch (parseError) {
                console.log("JSON Parsing Error:", parseError.message);
            }
        
            res.render('emp/layout', {
                body: 'detailorder',
                data: rows,
                order: parsedOrder,
                add: parsedOrder_add,
                user: userData
            });
        });
})

app.get('/emp/detail_order', emp_auth(['admin', 'jeweler']), function (req, res) {
    const userData = req.emp;
        const sql = `SELECT * FROM orders WHERE id=${req.query.id};`;
        db.all(sql, (err, rows) => {
            if (err) {
                console.log(err.message);
                return res.status(500).send("Failed to retrieve data.");
            }
            // console.log(rows)
            req.session.orderId = rows[0].id;
            const parsedOrder = JSON.parse(rows[0].order_detail);
            res.render('emp/layout', { body: 'detailorder', data: rows, order: parsedOrder, user: userData });
        });
})

app.get('/emp/category', emp_auth(['admin', 'jeweler']), (req, res) => {
    const userData = req.emp;
    res.render('emp/layout', { body: 'category', user: userData });

})

app.get('/emp/', emp_auth(['admin', 'jeweler']), (req, res) => {
    const category = req.query.name
    const userData = req.emp;

        let allProducts = {};
        const sql = `SELECT * FROM ${category}`;
        db.all(sql, (err, rows) => {
            if (err) {
                console.log(err.message);
                return res.status(500).send("Failed to retrieve data.");
            }
            allProducts[category] = rows;
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

app.get('/createProduct', emp_auth(['admin', 'jeweler']), function (req, res) {
    const userData = req.emp;
    let category = ['materials', 'pendants', 'stones'];
    let all_product = [];
    let count = 0;

    category.forEach((item, index) => {
        let sql = `SELECT * FROM ${item};`;
        db.all(sql, function(err, rows) {
            if (err) {
                return res.status(500).send("Failed to retrieve data.");
            }
            all_product[index] = rows;
            count++;

            if (count === category.length) {
                res.render('emp/layout', { body: 'createProduct', user: userData, data: all_product });
            }
        });
    });
});

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

//employee
app.get('/emp/login', function (req, res) {
    res.render('emp/login');
});

app.get('/emp/forgot', function (req, res) {
    res.render('emp/forgotpass');
});

app.post('/logout', (req, res) => {
    res.cookie('authToken', '', { expires: new Date(0), httpOnly: true });
    res.redirect('/');
});
    


app.post('/emp/logout', (req, res) => {
    res.cookie('authToken', '', { expires: new Date(0), httpOnly: true });
    // res.render('emp/login');
    res.redirect('/emp/login');
});


app.listen(port, () => {
    console.log(`listening to port ${port}`);
}); 