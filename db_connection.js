var mysql = require("mysql");
// run this in MySQL workbench ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'yourRootPassword'
var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

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
    start_employee_tracker()

//    connection.end();
});

async function display_all_tables() {
    const tables = ["department", "role", "employee"]
    tables.forEach(table => {
        display_table(table)
    })
};

async function display_table(table) {
    const res = await select_table(table)
    console.log(res);
}

function select_table(table){
    return new Promise ((resolve)=>{

        const query_str = "SELECT * from " + table
        connection.query(query_str, function (err, res) {
            if (err) throw err;
            console.log("\n\n+++++++++++ " + query_str + " +++++++++++")
            resolve (res);
        })
    })
}

display_all_tables()

const questions = [
    {
        type: "list",
        name: "what_to_do",
        message: "What would you like to do?",
        choices: [
            "Add Department", "View Departments",
            "Add Roles", "View Roles"
        ]
    },
    {
        type: "input",
        name: "department_name",
        message: "Input Department Name:",
        when: function(answers) {
            return answers.what_to_do == "Add Department"
        }
    },
    {
        type: "input",
        name: "role_title",
        message: "Input Role Title: ",
        when: function(answers) {
            return answers.what_to_do == "Add Role"
        }
    },
    {
        type: "input",
        name: "role_salary",
        message: "Input Role Salary: ",
        when: function(answers) {
            return answers.what_to_do == "Add Role"
        }
    },
    {
        type: "input",
        name: "role_department",
        message: "Input Role's Department: ",
        when: function(answers) {
            return answers.what_to_do == "Add Role"
        }
    },
]

const inquirer = require ("inquirer")

function start_employee_tracker(){

    inquirer.prompt(questions)
    .then((response) => {
        console.log(response)
        if (response.what_to_do == "Add Department"){
            add_department(response.department_name)
        } else if (response.what_to_do == "View Departments"){
            view_departments()
        } else if (response.what_to_do == "Add Role"){
            add_role(response.role_name)
        } else if (response.what_to_do == "View Roles"){
            view_role()
        }
        console.log("\n\n")
        display_all_tables()
    })
}

function add_department(department){
    const query_str = `INSERT INTO department (dept_name) VALUES ("${department}")`;
    connection.query(query_str, function (err, res) {
        if (err) throw err;
        console.log("\n\n+++++++++++ " + query_str + " +++++++++++")
        console.log(res);
    })
}

async function view_departments(){
    res = await select_table("department")
    console.log("List of Departments")
    res.forEach((dept) =>{
        console.log(dept.dept_name)
    })
}