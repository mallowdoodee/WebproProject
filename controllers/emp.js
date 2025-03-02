const db = require('../config/dbconn');
const bcrypt = require('bcrypt');

const emp_edit = async (req, res) => {
    try {
        const { id, fname, lname, phone, address, email } = req.body;
        // console.log(id);
        const sql = `UPDATE employees SET fname = ?, lname = ?, phone = ?, 
                    address = ?, email = ? WHERE id = ?;`;
        const userData = [fname, lname, phone, address, email, id];
        db.run(sql, userData, function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.redirect('/emp/manages');
        })
    }catch(error) {
        console.log(error);
    }
}

const emp_create = async (req, res) => {
    const { fname, lname, phone, address, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);        
    const empData = [fname, lname, phone, address, email, hashedPassword, role];
    const sql = `INSERT INTO employees (fname, lname, phone, address, email, password, role) VALUES (?, ?, ?, ?, ?, ?, ?);`;

    db.run(sql, empData, function (err){
        if (err) {
            console.error("Error processing request", err);
            return res.status(500).send({ message: "Error processing request" });
        }
        
        res.redirect('/emp/manages');
    });

}

const emp_delete = async (req, res) => {
    const { id } = req.body;
    const sql = `DELETE FROM employees WHERE id = ?`;
    db.run(sql, id, function (err) {
        if (err) {
            console.error('Error deleting employee:', err.message);
            return res.status(500).send({ message: "Error processing request" });
        }
        res.redirect('/emp/manages');
    })
}

const emp_editProfile = async (req, res) => {
    try {
        const { id, fname, lname, phone, address, email } = req.body;
        const sql = `UPDATE employees SET fname = ?, lname = ?, phone = ?, 
                    address = ?, email = ? WHERE id = ?;`;
        const userData = [fname, lname, phone, address, email, id];
        db.run(sql, userData, function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.redirect('/emp/profile');
        })
    }catch(error) {
        console.log(error);
    }
}

module.exports = { emp_edit, emp_create, emp_delete, emp_editProfile };