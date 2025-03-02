const db = require('../config/dbconn');

const prod_edit = (req, res) => {
    const { category, id, name, additional_price, description } = req.body;
    // console.log(category)
    const sql = `UPDATE ${category} SET name = ?, additional_price = ?, 
                    description = ? WHERE id = ?;`;
        const product = [name, additional_price, description, id];
        db.run(sql, product, function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            const updateProduct = {
                category,
                id,
                name,
                additional_price,
                description
            };
            // console.log(updateProduct)
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
        res.redirect('/emp/products');
    })
}

module.exports = { prod_edit, prod_delete };