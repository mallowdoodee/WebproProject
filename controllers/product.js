const db = require('../config/dbconn');

const prod_edit = (req, res) => {
    const { category, id, name, price, description } = req.body;
    console.log("category: ", category)
    const sql = `UPDATE ${category} SET name = ?, price = ?, 
                    description = ? WHERE id = ?;`;
    const product = [name, price, description, id];
        db.run(sql, product, function(err) {
            if (err) {
                console.log("errorrrrrrr")
                return res.status(500).json({ error: err.message });
            }
            const updateProduct = {
                category,
                id,
                name,
                price,
                description
            };
            console.log("success")
            res.json({ success: true, product: updateProduct })
        });

};

const prod_delete = (req, res) => {
    const { category, id } = req.body;
    console.log("category: ", category);
    console.log("id: ", id)
    const sql = `DELETE FROM ${category} WHERE id = ${id}`;
    db.run(sql, function (err) {
        if (err) {
            console.error('Error deleting employee:', err.message);
            return res.status(500).send({ message: "Error processing request" });
        }
        res.status(200).json({ message: 'ออเดอร์สำเร็จ' });
        // res.redirect(`/emp/?name=${category}`);
    })
}

const prod_create = (req, res) => {
    const formData = req.body;
    console.log(formData)
    let sql = ``;
    if (formData.category === 'products') {
        if (formData.typeProduct === 'สร้อยคอ' || formData.typeProduct === 'สร้อยข้อมือ') {
            sql = `INSERT INTO ${formData.category} (name, category, base_price, description, image_path, stock_quantity, 
            material, gemstone, color, pendant)
            VALUES ('${formData.name_prod}','${formData.typeProduct}', '${formData.base_price}', '${formData.description_prod}',
            '${formData.image}', '${formData.stock}', '${formData.materials}', '${formData.stones}', '${formData.color}', '${formData.pendants}');`;
        }else {
            sql = `INSERT INTO ${formData.category} (name, category, base_price, description, image_path, stock_quantity, 
            material, gemstone, color)
            VALUES ('${formData.name_prod}','${formData.typeProduct}', '${formData.base_price}', '${formData.description_prod}',
            '${formData.image}', '${formData.stock}', '${formData.materials}', '${formData.stones}', '${formData.color}');`;
        }
        
    }else {
        sql = `INSERT INTO ${formData.category} (name, price, description)
                VALUES ('${formData.name}', '${formData.price}', '${formData.description}');`;
    }

    db.run(sql, function (err) {
        if (err) {
            console.error("Error processing request", err);
            return res.status(500).send({ message: "Error processing request" });
        }
        res.status(200).json({ message: 'เพิ่มสินค้าสำเร็จ' });
    })
}

module.exports = { prod_edit, prod_delete, prod_create };