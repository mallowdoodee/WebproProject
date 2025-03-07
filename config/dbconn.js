const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('custommade (1).db', (err) => {    
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the SQlite database.');
  });

module.exports = db;