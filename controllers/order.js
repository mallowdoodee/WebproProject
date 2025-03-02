const db = require('../config/dbconn');

const order_from_cus = async (req, res) => {
    const user = req.isUser;
    const { category, size, material, stone, refImage, description, pendant, total } = req.body;
    let order_detail_json = {
        material,
        stone,
        refImage,
        description,
        total
    };
    if (category === 'Bracelets' || category === 'Necklaces') {
        order_detail_json.pendant = pendant;
    }else if (category === 'Rings') {
        order_detail_json.size = size;
    }

    // console.log("order_detail: ", order_detail)
    const order_detail = JSON.stringify(order_detail_json);
    const data = [user.id, order_detail, category]
    const sql = `INSERT INTO orders(customer_id, order_detail, category) VALUES (?, ?, ?)`;
    db.run(sql, data, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        console.log('Ok addddddd');
    })
}

module.exports = { order_from_cus }