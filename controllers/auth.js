const db = require('../config/dbconn'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const cus_register = async (req, res) => {
    try {
        const { fname, lname, phone, address, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const customerData = [fname, lname, phone, address, email, hashedPassword];
        const sql = `INSERT INTO customers (fname, lname, phone, address, email, password) VALUES (?, ?, ?, ?, ?, ?);`;

        db.run(sql, customerData, function (err){
            if (err) {
                console.log("user has already")
                console.error("Error processing request", err);
                return res.status(500).send({ message: "Error processing request" });
            }
            
            res.json({
                message: "Signup processed",
                lastID: this.lastID
            });
        });
    } catch (error) {
        console.error("Error processing request", error);
        res.status(500).send({ message: "Error processing request" });
    }
};


const cus_login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const sql = 'SELECT * FROM customers WHERE email = ?';
        db.all(sql, email, async function (err, results) {
            if (err) {
                console.error("Error processing request", err);
                return res.status(500).send({ message: "Error processing request" });
            }
            if (results.length === 0) {
                res.status(401).send('Authentication failed: user not found.');
                return;
            }
            const userData = results[0];
            const comparison = await bcrypt.compare(password, userData.password);
            if (!comparison) {
                res.status(400).json({
                    message: "Login Failed"
                });
                return false;
            }
            var payload = {
                users: {
                    id: userData.id,
                    email: email,
                    isMember: true
                }
            };
            jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
                if (err) {
                    return res.status(500).json({ message: "Error signing token" });
                };
                res.cookie('authToken', token, { httpOnly: true, secure: true });
                // res.redirect('/product');
                res.json({
                    message: "Login successful!",
                    token, payload
                });
            });
        });
    } catch (error) {
        console.error("Unexpected error", error);
        res.status(500).json({ message: "Unexpected error processing login" });
    }
};

const cus_forgot = async (req, res) => {
    try {
        const { email, password } = req.body;
        // console.log(email);
        const sql = 'SELECT * FROM customers WHERE email = ?';
        db.all(sql, email, async function (err, results) {
            // console.log(results);
            if (err) {
                console.error("Error processing request", err);
                return res.status(500).send({ message: "Error processing request" });
            }
            if (results.length === 0) {
                res.status(401).send('Authentication failed: user not found.');
                return;
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const update = 'UPDATE customers SET password = ? WHERE email = ?';
            db.run(update, [hashedPassword, email], function (err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.redirect('/login');
            })

        })

    }catch (error) {
        console.log('error', error);
    }
}

const emp_login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const sql = 'SELECT * FROM employees WHERE email = ?';
        db.all(sql, email, async function (err, results) {
            // console.log(results);
            if (err) {
                console.error("Error processing request", err);
                return res.status(500).send({ message: "Error processing request" });
            }
            if (results.length === 0) {
                res.status(401).send('Authentication failed: user not found.');
                return;
            }
            const userData = results[0];
            // console.log(userData);
            const comparison = await bcrypt.compare(password, userData.password);
            if (!comparison) {
                res.status(400).json({
                    message: "Login Failed (wrong email or password)"
                });
                return false;
            }
            var payload = {
                users: {
                    id: userData.id,
                    email: email,
                    role: userData.role
                }
            };

            // console.log(payload);
            jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
                if (err) throw err;
                res.cookie('authToken', token, { httpOnly: true, secure: true });
                return res.redirect('/emp/orders');
                // res.json({
                //     message: "Login successful!",
                //     token, payload,
                //     redirect: "/emp_route"
                // });
            });
        });
    } catch (error) {
        // console.log("noo");
        console.log('error', error);
    }

}

const emp_forgot = async (req, res) => {
    try {
        const { email, password } = req.body;
        // console.log(email);
        const sql = 'SELECT * FROM employees WHERE email = ?';
        db.all(sql, email, async function (err, results) {
            // console.log(results);
            if (err) {
                console.error("Error processing request", err);
                return res.status(500).send({ message: "Error processing request" });
            }
            if (results.length === 0) {
                res.status(401).send('Authentication failed: user not found.');
                return;
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const update = 'UPDATE employees SET password = ? WHERE email = ?';
            db.run(update, [hashedPassword, email], function (err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.redirect('/emp/login');
            })

        })

    }catch (error) {
        console.log('error', error);
    }
}

module.exports = { cus_register, cus_login, cus_forgot, emp_login, emp_forgot };