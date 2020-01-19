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
            "Add Employee", "View Employees", "Update Employee Role", "Exit"
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
    // {
    //     type: "input",
    //     name: "role_title",
    //     message: "Input Role Title: ",
    //     when: function (answers) {

    //         return answers.what_to_do == "Add Role"
    //     }
    // },
    // {
    //     type: "input",
    //     name: "role_salary",
    //     message: "Input Role Salary (all numbers no characters): ",
    //     when: function (answers) {
    //         return answers.what_to_do == "Add Role"
    //     }
    // },
    // {
    //     type: "input",
    //     name: "employee_first_name",
    //     message: "Input Employee's First Name: ",
    //     when: function (answers) {
    //         return answers.what_to_do == "Add Employee"
    //     }
    // },
    // {
    //     type: "input",
    //     name: "employee_last_name",
    //     message: "Input Employee's Last Name: ",
    //     when: function (answers) {
    //         return answers.what_to_do == "Add Employee"
    //     }
    // },
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
            } else if (response.what_to_do == "Exit") {
                console.log("Thank you for using Employee Tracker!")
                console.log("Session Ended")
                display_all_tables()
                return connection.end()
            }
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
        console.table(res);
        start_employee_tracker()
    })

}

async function view_departments() {
    const query_str = "SELECT * from department"
    connection.query(query_str, function (err, res) {
        if (err) throw err;
        console.log("\n\n+++++++++++ " + query_str + " +++++++++++")
        console.log("========= List of Departments =========");
        console.table(res);
        start_employee_tracker();
        return res;
    })
}

function add_role(role) {
    console.log("=========Add role==========")
    const get_dept_query_str = 'SELECT * FROM department'
    connection.query(get_dept_query_str, function (err, department_table) {
        let departments = [];

        department_table.forEach(dept => {
            departments.push(dept.dept_name)
        })

        if (departments.length === 0) {
            console.log("You must add a department first.")
            return start_employee_tracker();
        }

        const role_dept_questions = [
            {
                type: "input",
                name: "role_title",
                message: "Input Role Title: ",
                // when: function (answers) {
                //     return answers.what_to_do === "Add Role"
                // }
            },
            {
                type: "input",
                name: "role_salary",
                message: "Input Role Salary (all numbers no characters): ",
                // when: function (answers) {
                //     return answers.what_to_do == "Add Role"
                // }
            },
            {
                type: "list",
                name: "role_department",
                message: "Input Role's Department: ",
                choices: departments
            }
        ]
        inquirer.prompt(role_dept_questions).then((response) => {
            let query_str;
            for (let i = 0; i <= department_table.length; i += 1) {
                if (response.role_department === department_table[i].dept_name) {
                    query_str =
                        `
                        INSERT INTO role (title, salary, dept_id)
                        VALUES ("${response.role_title}", "${response.role_salary}", "${department_table[i].dept_id}")
                    `;
                    break;
                }

            };

            connection.query(query_str, function (err, res) {
                if (err) throw err;
                console.log("\n\n+++++++++++ " + query_str + "\n+++++++++++")
                console.table(res);
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
        console.table(res)
        start_employee_tracker()
    })

}

async function add_employee(restart_employee_tracker = true) {
    console.log()
    console.log("========= Add employee ==========")
    let role_list = []
    connection.query("SELECT role_id, title, dept_name, salary  FROM role LEFT JOIN department ON department.dept_id = role.dept_id", (err, role_table) => {
        console.table(role_table)
        if (role_table.length === 0){
            console.log("+++++++++++++++++++++++++++++++")
            console.log("You must add a role first")
            console.log("+++++++++++++++++++++++++++++++")
            return start_employee_tracker()
        }
        role_table.forEach(role => {
            role_list.push(role.title + " " + role.dept_name + " " + role.salary)
        });
        connection.query("SELECT emp_id, first_name, last_name from employee", (err, employee_table) => {
            console.table(employee_table)
            employee_table = [];

            let employee_list = []
            employee_table.forEach(emp => {
                employee_list.push(emp.first_name + " " + emp.last_name);
            })

            let role_questions = [
                {
                    type: "input",
                    name: "employee_first_name",
                    message: "Input Employee's First Name: ",
                },
                {
                    type: "input",
                    name: "employee_last_name",
                    message: "Input Employee's Last Name: ",
                },
                {
                    type: "list",
                    name: "employee_role",
                    message: "Input Employee's Role: ",
                    choices: role_list
                },
                {
                    type: "list",
                    name: "employee_manager",
                    message: "Input Employee's Manager: ",
                    choices: employee_list,
                    when: function(answers){
                        return employee_list >= 1
                    }
                }
            ]

            inquirer.prompt(role_questions)
                .then((role_questions_response) => {
                    let role_id;
                    for (let j = 0; j <= role_list.length; j += 1) {
                        if (role_questions_response.employee_role === role_table[j].title + " " + role_table[j].dept_name + " " + role_table[j].salary) {
                            role_id = role_table[j].role_id;
                            break;
                        }
                    }

                    // default manager_id to 1 if employee_table is empty
                    let manager_id = 1;
                    for (let index = 0; index < employee_table.length; index++) {
                        console.log(role_questions_response.employee_manager + " === " + employee_table[index].last_name + "is " +
                            role_questions_response.employee_manager === employee_table[index].first_name + " " + employee_table[index].last_name)
                        if (role_questions_response.employee_manager === employee_table[index].first_name + " " + employee_table[index].last_name) {
                            manager_id = employee_table[index].emp_id;
                            break;
                        }

                    }

                    const query_str =
                        `
                            INSERT INTO employee (first_name, last_name, role_id, manager_id)
                            VALUES (
                                "${role_questions_response.employee_first_name}",
                                "${role_questions_response.employee_last_name}",
                                "${role_id}",
                                "${manager_id}"
                            )
                        `;

                    connection.query(query_str, function (err, res) {
                        if (err) throw err;
                        console.log("\n\n+++++++++++ " + query_str + " \n+++++++++++")
                        console.table(res);
                        if(restart_employee_tracker){
                            return start_employee_tracker()
                        }
                        return
                    })

                })
        })
    })

}

async function view_employees() {
    console.log("========= List of employees =========")
    const query_str =
        `
            SELECT first_name as "First Name", last_name as "Last Name", title as Title, salary as Salary
            FROM employee
            LEFT JOIN role
            ON employee.role_id = role.role_id;
        `
    console.log("\n\n+++++++++++ " + query_str + "\n+++++++++++")
    connection.query(query_str, function (err, res) {
        if (err) throw err;
        console.table(res)
        //  res.forEach((employee) => {
        //    console.table(employee.first_name, employee.last_name, employee.title, employee.salary)
        //})
        start_employee_tracker()
    })
}

async function update_employee_roles(update) {
    const get_employees_query =
        `
            SELECT emp_id, first_name, last_name
            FROM employee
        `;
    const get_roles_query =
        `
            SELECT role_id as Role, title as Title, dept_name as Department, salary as Salary
            FROM role
            LEFT JOIN department ON department.dept_id = role.dept_id
        `;
    const update_role_query =
        `
            UPDATE employee
            SET role_id= ?
            WHERE emp_id = ?
        `;

    let employee_table;
    let employee_list = [];
    let role_table;
    let role_list = [];

    connection.query(get_employees_query, function (err, emp_table) {
            if (err) throw err;

            if (emp_table.length === 0){
                console.log("+++++++++++++++++++++++++++++++")
                console.log("You must add an employee first.")
                console.log("+++++++++++++++++++++++++++++++")
                return start_employee_tracker();
            }
            employee_table = emp_table;
            emp_table.forEach(emp => {
                employee_list.push(emp.first_name + " " + emp.last_name);
            })
            connection.query(get_roles_query, function (err, roles_table) {
                    if (roles_table.length === 0){
                        console.log("You must add a role first");
                        return start_employee_tracker();
                    }
                    role_table = roles_table;
                    roles_table.forEach(role => {
                        role_list.push(role.Title + " " + role.Department + " " + role.Salary)
                    });
                    const update_role_questions = [

                        {
                            type: "list",
                            name: "employee",
                            message: "Select Employee new: ",
                            choices: employee_list
                        },
                        {
                            type: "list",
                            name: "employee_role",
                            message: "Select New Role: ",
                            choices: role_list
                        },
                    ]

                    inquirer.prompt(update_role_questions)
                        .then((update_role_questions_response) => {
                            let role_id;
                            for (let j = 0; j <= role_list.length; j += 1) {
                                if (update_role_questions_response.employee_role === role_table[j].Title + " " + role_table[j].Department + " " + role_table[j].Salary) {
                                    role_id = role_table[j].Role;
                                    console.log("++++++++ role_id +++++++++++")
                                    console.log(role_id)
                                    break;
                                }
                            }

                            let emp_id;
                            for (let index = 0; index < employee_table.length; index++) {
                                if (update_role_questions_response.employee === employee_table[index].first_name + " " + employee_table[index].last_name) {
                                    emp_id = employee_table[index].emp_id;
                                    console.log("++++++++ emp_id +++++++++++")
                                    console.log(emp_id)
                                    break;
                                }
                            }

                            connection.query(update_role_query,[role_id, emp_id], function(err) {
                                if (err) throw err;
                                start_employee_tracker()
                            })
                        })
                        .catch((err)=>{
                            console.log(err);
                }) // inquier update roles questions

                }) //get roles query
        })
}
