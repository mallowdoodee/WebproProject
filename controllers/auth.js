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
                console.error("Error processing request", err);
                return res.status(500).send({ message: "Error processing request" });
            }
            res.json({
                message: "Signup processed",
                lastID: this.lastID
            });
        });

        // conn.query(sql, customerData, function (err, results) {
        //     if (err) {
        //         console.error("Error processing request", err);
        //         return res.status(500).send({ message: "Error processing request" });
        //     }
        //     console.log(results);
        //     res.json({
        //         message: "Signup processed",
        //         results
        //     });
        // });
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
                    email: email,
                    isMember: true
                }
            };
            jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
                if (err) throw err;
                res.cookie('authToken', token, { maxAge: 300000, httpOnly: true, secure: true });
                res.json({
                    message: "Login successful!",
                    token, payload
                });
            });
        });
        // conn.query(sql, email, async function (err, results) {
        //     if (err) {
        //         console.error("Error processing request", err);
        //         return res.status(500).send({ message: "Error processing request" });
        //     }
        //     if (results.length === 0) {
        //         res.status(401).send('Authentication failed: user not found.');
        //         return;
        //     }
        //     const userData = results[0];
        //     const comparison = await bcrypt.compare(password, userData.password);
        //     if (!comparison) {
        //         res.status(400).json({
        //             message: "Login Failed"
        //         });
        //         return false;
        //     }
        //     var payload = {
        //         users: {
        //             email: email,
        //             isMember: true
        //         }
        //     };
        //     jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 10000 }, (err, token) => {
        //         if (err) throw err;
        //         res.cookie('authToken', token, { httpOnly: true, secure: true });
        //         res.json({
        //             message: "Login successful!",
        //             token, payload
        //         });
        //     });
        // });
    } catch (error) {
        console.log("noo");
        console.log('error', error);
    }
};

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
                    email: email,
                    role: userData.role
                }
            };

            // console.log(payload);
            jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
                if (err) throw err;
                res.cookie('authToken', token, { httpOnly: true, secure: true });
                return res.redirect('/emp_route');
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

module.exports = { cus_register, cus_login, emp_login };