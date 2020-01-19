CREATE DATABASE employee_db;
USE employee_db;

#**department**:
CREATE TABLE department(
  dept_id INTEGER AUTO_INCREMENT PRIMARY KEY,
  dept_name VARCHAR(30)
);
SELECT * from department;

# **role**
CREATE TABLE role(
  role_id INTEGER AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(30),
  salary DECIMAL(10,2),
  dept_id INTEGER
  FOREIGN KEY (dept_id) REFERENCES department(dept_id)
);
SELECT * from role;

#* **employee**:
CREATE TABLE employee(
	emp_id INT AUTO_INCREMENT PRIMARY KEY,
	first_name VARCHAR(30), # to hold employee first name
	last_name VARCHAR(30), # to hold employee last name
	role_id INT, # to hold reference to role employee has
	manager_id INT # to hold reference to another employee that manager of the current employee. This field may be null if the employee has no manager
    FOREIGN KEY (role_id) REFERENCES role(role_id)
    FOREIGN KEY (manager_id) REFERENCES employee(emp_id)
  );

  SELECT * from employee;