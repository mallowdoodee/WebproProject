const jwt = require('jsonwebtoken');
const path = require('path');

const cus_auth = async(req, res, next, optional = false) => {
    try {
        const token = req.cookies.authToken;
        if (!token) {
            if (optional) {
                req.isUser = "";
                return next(); // ถ้า optional ให้ไปต่อแทน redirect
            }
            return res.redirect('/login'); // ถ้าไม่ใช่ optional ให้ redirect
        }
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        req.isUser = decode.users; //เอาข้อมูล users(payload) เก็บใน req.isUser(เปลี่ยนชื่อตัวแปร isUser ได้)
        next();
    }catch (error) {
        console.log('Error', error);
        res.redirect('/login');
    }
}

const optional_cus_auth = (req, res, next) => {
    // console.log("yess")
    cus_auth(req, res, next, true); // ส่ง true เพื่อบอกว่าเป็น optional
};

const emp_auth = (allowedRoles = []) => {
    return async(req, res, next) => {
        try {
            const token = req.cookies.authToken;
            if (!token) {
                return res.redirect('/emp/login');
            }
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            req.emp = decode.users;
            if (allowedRoles.length > 0 && !allowedRoles.includes(req.emp.role)) {
                return res.status(404).sendFile(path.join(__dirname, '..', 'public', 'error404.html'));
            }
            next();
        }catch (error) {
            console.log(error)
            return res.redirect('/emp/login');
        }
    }
} 

module.exports = { cus_auth, emp_auth, optional_cus_auth };