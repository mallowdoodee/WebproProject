const jwt = require('jsonwebtoken');

const cus_auth = async(req, res, next) => {
    try {
        const token = req.cookies.authToken;
        // const token = "";
        if (!token) {
            // console.log("no token")
            res.redirect('/login');
            return;
        }
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        req.isUser = decode.users; //เอาข้อมูล users(payload) เก็บใน req.isUser(เปลี่ยนชื่อตัวแปร isUser ได้)
        next();
    }catch (error) {
        console.log('Error', error);
        res.send("Token Invalid!").status(500);
    }
}

const emp_auth = async(req, res, next) => {
    try {
        const token = req.cookies.authToken;
        // console.log("yess middleware");
        if (!token) {
            return res.redirect('/emp/login');
        }
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        req.emp = decode.users;
        next();
    }catch (error) {
        return res.redirect('/login');
    }
}

module.exports = { cus_auth, emp_auth };