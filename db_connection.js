var mysql = require("mysql");
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

function select_table(table) {

    const query_str = "SELECT * from " + table
    connection.query(query_str, function (err, res) {
        if (err) throw err;
        console.log("\n\n+++++++++++ " + query_str + " +++++++++++")
        console.log(res)
        return res;
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
            "Add Role", "View Roles",
            "Add Employee", "View Employees", "Update Employee Role", "Done"
        ]
    },
    {
        type: "input",
        name: "department_name",
        message: "Input Department Name:",
        when: function (answers) {
            return answers.what_to_do == "Add Department"
        }
    },
    {
        type: "input",
        name: "role_title",
        message: "Input Role Title: ",
        when: function (answers) {
            return answers.what_to_do == "Add Role"
        }
    },
    {
        type: "input",
        name: "role_salary",
        message: "Input Role Salary (all numbers no characters): ",
        when: function (answers) {
            return answers.what_to_do == "Add Role"
        }
    },
    // {
    //     type: "input",
    //     name: "role_department",
    //     message: "Input Role's Department: ",
    //     when: function (answers) {
    //         return answers.what_to_do == "Add Role"
    //     }
    // },
    {
        type: "input",
        name: "employee_first_name",
        message: "Input Employee's First Name: ",
        when: function (answers) {
            return answers.what_to_do == "Add Employee"
        }
    },
    {
        type: "input",
        name: "employee_last_name",
        message: "Input Employee's Last Name: ",
        when: function (answers) {
            return answers.what_to_do == "Add Employee"
        }
    },
    {
        type: "input",
        name: "employee_role",
        message: "Input Employee's Role: ",
        when: function (answers) {
            return answers.what_to_do == "Add Employee"
        }
    },
    {
        type: "input",
        name: "employee_manager",
        message: "Input Employee's Manager: ",
        when: function (answers) {
            return answers.what_to_do == "Add Employee"
        }
    },
    {
        type: "input",
        name: "selected_employee",
        message: "Select Employee: ",
        when: function (answers) {
            return answers.what_to_do == "Update Employee Role"
        }
    },
    {
        type: "input",
        name: "new_employee_role",
        message: "Select New Employee Role: ",
        when: function (answers) {
            return answers.what_to_do == "Update Employee Role"
        }
    }
]

const inquirer = require("inquirer")

function start_employee_tracker() {

    inquirer.prompt(questions)
        .then((response) => {
            console.log(response)
            if (response.what_to_do == "Add Department") {
                add_department(response.department_name);
            } else if (response.what_to_do == "View Departments") {
                view_departments();
            } else if (response.what_to_do == "Add Role") {
                add_role(response);
            } else if (response.what_to_do == "View Roles") {
                view_roles();
            } else if (response.what_to_do == "Add Employee") {
                add_employee(response);
            } else if (response.what_to_do == "View Employees") {
                view_employees();
            } else if (response.what_to_do == "Update Employee Role") {
                update_employee_roles(response);
            } else if (response.what_to_do == "Done") {
                console.log("Thank you for using Employee Tracker!")
                console.log("Session Ended")
                display_all_tables()
                return connection.end()
            }
            console.log("-------Waiting to start again--------")
            // start_employee_tracker()
        }).catch((err) => {
            console.log(err)
            console.log("An Error Occured")
            console.log("Session Ended")
            display_all_tables()
            return connection.end()
        })
}

function add_department(department) {
    const query_str =
        `
            INSERT INTO department (dept_name)
            VALUES ("${department}")
        `;
    connection.query(query_str, function (err, res) {
        if (err) throw err;
        console.log("\n\n+++++++++++ " + query_str + "\n+++++++++++")
        console.log(res);
        start_employee_tracker()
    })

}

async function view_departments() {
    const query_str = "SELECT * from department"
    connection.query(query_str, function (err, res) {
        if (err) throw err;
        console.log("\n\n+++++++++++ " + query_str + " +++++++++++")
        console.log("========= List of Departments =========");
        res.forEach((dept) => {
            console.log(dept.dept_name);
        })
        start_employee_tracker();
        return res;
    })
}

function add_role(role) {
    console.log(role)
    console.log("=========Add role==========")
    const get_dept_query_str = 'SELECT * FROM department'
    connection.query(get_dept_query_str, function (err, department_table) {
        let departments = [];
        department_table.forEach(dept => {
            departments.push(dept.dept_name)
        })

        const role_dept_questions = {
            type: "list",
            name: "role_department",
            message: "Input Role's Department: ",
            choices: departments
        }
        inquirer.prompt(role_dept_questions).then((response) => {
            let query_str;
            for (let i = 0; i <= department_table.length; i += 1) {
                if (response.role_department === department_table[i].dept_name) {
                    query_str =
                        `
                        INSERT INTO role (title, salary, dept_id)
                        VALUES ("${role.role_title}", "${role.role_salary}", "${department_table[i].dept_id}")
                    `;
                    break;
                }

            };

            connection.query(query_str, function (err, res) {
                if (err) throw err;
                console.log("\n\n+++++++++++ " + query_str + "\n+++++++++++")
                console.log(res);
                start_employee_tracker()
            })
        })
    })

}

async function view_roles() {

    console.log("========= List of roles =========")
    const query_str =
        `
                SELECT title, salary, dept_name
                FROM role
                LEFT JOIN department
                ON role.dept_id = department.dept_id
            `
    console.log("\n\n+++++++++++ " + query_str + "\n+++++++++++")
    connection.query(query_str, function (err, res) {
        if (err) throw err;
        console.log(res)
        res.forEach((role) => {
            console.log(role.title, role.salary, role.dept_name)
        })
        start_employee_tracker()
    })

}

function add_employee(employee) {
    console.log(employee)
    console.log("========= Add employee ==========")


    const query_str =
        `
            INSERT INTO employee (first_name, last_name, role_id, manager_id)
            VALUES (
                "${employee.employee_first_name}",
                "${employee.employee_last_name}",
                "${employee.employee_role}",
                "${employee.employee_manager}"
            )
        `;
    connection.query(query_str, function (err, res) {
        if (err) throw err;
        console.log("\n\n+++++++++++ " + query_str + " \n+++++++++++")
        console.log(res);
        start_employee_tracker()
    })

}

async function view_employees() {
    console.log("========= List of employees =========")
    const query_str =
        `
                SELECT first_name, last_name, title, salary
                FROM employee
                LEFT JOIN role
                ON employee.role_id = role.role_id
            `
    console.log("\n\n+++++++++++ " + query_str + "\n+++++++++++")
    connection.query(query_str, function (err, res) {
        if (err) throw err;
        console.log(res)
        res.forEach((employee) => {
            console.log(employee.first_name, employee.last_name, employee.title, employee.salary)
        })
        start_employee_tracker()
    })
}

function update_employee_roles(update) {
    console.log(`Update employee #${update.selected_employee} with role: ${update.new_employee_role}`)
    const query_str =
        `
            UPDATE employee
            SET role_id= "${update.new_employee_role}"
            WHERE emp_id = "${update.selected_employee}"
        `
    console.log("\n\n+++++++++++ " + query_str + " \n+++++++++++")
    connection.query(query_str, function (err, res) {
        if (err) throw err;
        start_employee_tracker()
    })
}