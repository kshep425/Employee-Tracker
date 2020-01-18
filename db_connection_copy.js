var mysql = require("mysql");
require("console.table")
// run this in MySQL workbench ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'yourRootPassword'
var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: process.env.PORT || 3306,

    // Your username
    user: "root",

    // Your password
    password: "yourRootPassword",
    database: "employee_db"
});

connection.connect(function (err) {
    if (err) {
        console.log("This isn't working!!!!" + connection.config)
        throw err;
    }
    console.log("connected as id " + connection.threadId);

    query = "SELECT * from departments"
    sql(query).then(function(err, res){
        if (err) throw err;
        console.table(res)
    })
})

function sql(statement){
    connection.query(statement)
}
