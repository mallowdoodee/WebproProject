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
    // console.log("category: ", category);
    // console.log("id: ", id)
    const sql = `DELETE FROM ${category} WHERE id = ${id}`;
    db.run(sql, function (err) {
        if (err) {
            console.error('Error deleting employee:', err.message);
            return res.status(500).send({ message: "Error processing request" });
        }
        res.status(200).json({ message: '][ออเดอร์สำเร็จ' });
        // res.redirect(`/emp/?name=${category}`);
    })
}

module.exports = { prod_edit, prod_delete };