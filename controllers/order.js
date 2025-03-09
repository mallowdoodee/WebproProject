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
    if (category === 'สร้อยข้อมือ' || category === 'สร้อยคอ') {
        order_detail_json.pendant = pendant;
    }else if (category === 'แหวน') {
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
        console.log('เพิ่มออเดอร์สำเร็จ');
        res.status(200).json({ message: 'เพิ่มออเดอร์สำเร็จ' });
    })
}

const save_order = (req, res) => {
    const user = req.isUser;
    // console.log('yess')
    const { category, size, material, stone, refImage, description, pendant, total } = req.body;
    let order_detail_json = {
        material,
        stone,
        refImage,
        description,
        total
    };
    
    if (category === 'สร้อยข้อมือ' || category === 'สร้อยคอ') {
        order_detail_json.pendant = pendant;
    }else if (category === 'แหวน') {
        order_detail_json.size = size;
    }
    // console.log(order_detail_json)
    // console.log("order_detail: ", order_detail)
    const order_detail = JSON.stringify(order_detail_json);
    const data = [user.id, "แก้ไขต่อ", order_detail, category]
    const sql = `INSERT INTO orders(customer_id, order_status, order_detail, category) VALUES (?, ?, ?, ?)`;
    db.run(sql, data, function(err) {
        if (err) {
            console.log(err)
            return res.status(500).json({ error: err.message });
        }
        console.log('บันทึกออเดอร์สำเร็จ');
        res.status(200).json({ message: 'บันทึกออเดอร์สำเร็จ' });
    })
};

const save_editOrder = (req, res) => {
    // const orderId = req.session.orderId;
    const user = req.isUser;    
    const { id, category, size, material, stone, refImage, description, pendant, total } = req.body;
    // console.log(id)
    let order_detail_json = {
        material,
        stone,
        refImage,
        description,
        total
    };
    if (category === 'สร้อยข้อมือ' || category === 'สร้อยคอ') {
        order_detail_json.pendant = pendant;
    }else if (category === 'แหวน') {
        order_detail_json.size = size;
    }
    

    const order_detail = JSON.stringify(order_detail_json);
    const data = [order_detail, 'แก้ไขต่อ', id, user.id]    
    const sql = `UPDATE orders SET order_detail = ?, order_status = ?, 
        updated_at = CURRENT_TIMESTAMP WHERE id = ? AND customer_id = ?;`;

    db.run(sql, data, function(err) {
        if (err) {
            console.log(err)
            return res.status(500).json({ error: err.message });
        }
        console.log('บันทึกออเดอร์สำเร็จ');
        res.status(200).json({ message: 'บันทึกออเดอร์สำเร็จ', id });
    });
}

const update_order_from_cus = (req, res) => {
    const user = req.isUser;
    const { id, jeweler_id, category, size, material, stone, refImage, description, pendant, total } = req.body;
    let order_detail_json = {
        material,
        stone,
        refImage,
        description,
        total
    };
    if (category === 'สร้อยข้อมือ' || category === 'สร้อยคอ') {
        order_detail_json.pendant = pendant;
    }else if (category === 'แหวน') {
        order_detail_json.size = size;
    }
    console.log("jeweler_id: ", jeweler_id)
    const order_detail = JSON.stringify(order_detail_json);
    // const data = [order_detail, 'รอดำเนินการ', id, user.id]
    let sql = ``;
    let data = [];
    if (!jeweler_id) {
        sql = `UPDATE orders SET order_detail = ?, order_status = ?, 
        updated_at = CURRENT_TIMESTAMP WHERE id = ? AND customer_id = ?;`
        data = [order_detail, 'รอดำเนินการ', id, user.id]
    }else {
        sql = `UPDATE orders SET order_detail = ?, order_status = ?, 
        updated_at = CURRENT_TIMESTAMP WHERE id = ? AND customer_id = ?;`
        data = [order_detail, 'แก้ไขออเดอร์แล้วรอตรวจสอบ', id, user.id]
    }

    db.run(sql, data, function(err) {
        if (err) {
            console.log(err)
            return res.status(500).json({ error: err.message });
        }
        console.log('บันทึกออเดอร์สำเร็จ');
        res.status(200).json({ message: 'บันทึกออเดอร์สำเร็จ' });
    })

}

const cancel_order = (req, res) => {
    console.log('yess')
    const user = req.isUser;
    const { id } = req.body;
    console.log(id);
    const sql = `DELETE FROM orders WHERE id = ${id} AND customer_id = ${user.id};`;
    db.run(sql, function (err) {
        if (err) {
            console.log(err)
            return res.status(500).json({ error: err.message });
        }
        console.log('ยกเลิกออเดอร์สำเร็จ');
        res.status(200).json({ message: 'ยกเลิกออเดอร์สำเร็จ' });
    });
}

const accept_order = async (req, res) => {
    const userData = req.emp;
    const { id, add_order, add_total } = req.body;
    const order = {
        add_order,
        add_total
    };
    const add_order_json = JSON.stringify(order);
    
    let sql = "";
    let data = [];

    if (add_order.length === 0 && add_total === 0) {
        sql = `UPDATE orders SET jeweler_id = ?, order_status = "ยอมรับออเดอร์แล้ว", updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        data = [userData.id, id];
    } else {
        sql = `UPDATE orders SET jeweler_id = ?, add_order = ?, order_status = "ยอมรับออเดอร์แล้ว", updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        data = [userData.id, add_order_json, id];
    }

    db.run(sql, data, function (err) {
        if (err) {
            console.log(err)
            return res.status(500).json({ error: err.message });
        }
        console.log('อัปเดตออเดอร์สำเร็จ');
        res.status(200).json({ message: 'อัปเดตออเดอร์สำเร็จ' });
    });
};

const payment_check = (req, res) => {
    const { id } = req.body;
    const sql = `UPDATE orders SET order_status = "รับออเดอร์", payment_status = "paid",
                updated_at = CURRENT_TIMESTAMP WHERE id=${id}`;
    db.run(sql, function (err) {
        if (err) {
            console.log(err)
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ message: 'อัปเดตออเดอร์สำเร็จ', order_id: id });
    })
    
};

const decline_order = (req, res) => {
    const userData = req.emp;
    const { id, description } = req.body;
    // console.log(description)
    // console.log(id)

    const sql = `UPDATE orders SET order_status = "ปฏิเสธการรับออเดอร์", decline_reason = "${description}", 
        jeweler_id = ${userData.id}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`;
    db.run(sql, function (err) {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: err.message })
        }
        res.status(200).json({ message: 'ปฏิเสธออเดอร์สำเร็จ' })
    })
}

const delivery = (req, res) => {
    // const orderId = req.session.orderId;
    const { id, delivery } = req.body;
    // console.log(delivery)
    // console.log(orderId)
    const sql = `UPDATE orders SET order_status = 'กำลังจัดส่ง', updated_at = CURRENT_TIMESTAMP, 
    parcel_number = ${delivery} WHERE id = ${id}`;
    db.run(sql, function (err) {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: err.message })
        }
        res.status(200).json({ message: 'กำลังจัดส่งออเดอร์', order_id: id })
    })
}

const success_order = (req, res) => {
    const { id } = req.body;
    // const orderId = req.session.orderId;
    // console.log(orderId);
    const sql = `UPDATE orders SET order_status = 'จัดส่งสำเร็จ', updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`;
    db.run(sql, function (err) {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: err.message })
        }
        res.status(200).json({ message: 'จัดส่งออเดอร์สำเร็จแล้ว', order_id: id })
    })
}
module.exports = { order_from_cus, save_order, save_editOrder, update_order_from_cus, cancel_order, accept_order, payment_check, decline_order, delivery, success_order }