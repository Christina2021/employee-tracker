const mysql = require('mysql');

var connection = mysql.createConnection({
    host: "localhost",
  
    // Port; if not 3306
    port: 3306,
  
    // Username
    user: "root",
  
    // Password
    password: "",
    database: "employees"
});
  
connection.connect(function(err) {
    if (err) throw err;
});