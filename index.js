//Packages needed
const mysql = require("mysql");
const inquirer = require("inquirer");
const logo = require("asciiart-logo");
const cTable = require('console.table');
const config = require('./package.json');
const db = require('./db/connection.js');

//Variables used
let departments = [];
let departmentsId = [];
let roles = [];
let rolesId = [];
let managers = [];
let managersId = [];
let employees = [];
let employeesId = [];

//Using asciiart-logo for a title
//Used npm documentation in which the console will display the name, version, and description.
function title() {
    console.log(logo(config).render());
    //Start prompts
    mainPrompts();
}

//Main prompts for user to choose
function mainPrompts() {
    //Reset variables to be updated with new data
    departments = [];
    departmentsId = [];
    roles = [];
    rolesId = [];
    managers = [];
    managersId = [];
    employees = [];
    employeesId = [];

    //Gets current data from database to save in the variables
    //Department data
    db.query('SELECT * FROM department ORDER BY department.id', function(err,res){
        res.forEach((item) => {
            departments.push(item.name);
            departmentsId.push(item.id)
        })
    });
    //Roles data
    db.query('SELECT * FROM role', function(err, res){
        res.forEach((item) => {
            roles.push(item.title);
            rolesId.push(item.id)
        })
    })
    //Managers data
    db.query('SELECT * FROM employee', function(err,res){
        res.forEach((item) => {
            if(!item.manager_id) {
                managers.push(item.first_name + " " + item.last_name);
                managersId.push(item.id);
            }
        })
    });
    //Employees data
    db.query('SELECT * FROM employee ORDER BY employee.id', function(err,res){
        res.forEach((item) => {
            employees.push(`${item.first_name} ${item.last_name}`)
            employeesId.push(item.id)
        })
    });
   

    console.log("==================================================================================================");

    inquirer
    .prompt(
        {
            type: 'list',
            message: 'What would you like to do?',
            choices: [
                'View All Employees',
                'View All Employees By Department',
                'View All Employees By Manager',
                'Add Employee',
                'Remove Employee',
                'Update Employee Role',
                'Update Employee Manager',
                'View All Roles',
                'Add Role',
                'Remove Role',
                'View All Departments',
                'View the Total Utilized Budget of a Department',
                'Add Department',
                'Remove Department',
                'Quit'
            ],
            name: 'action'
        }
    )
    .then((response) => {
        
        console.log("==================================================================================================");

        //Function called based on the response
        switch (response.action) {
            case 'View All Employees':
                viewAllEmployees();
                break;
            case 'View All Employees By Department':
                viewEmployeesByDepartment(departments);
                break;
            case 'View All Employees By Manager':
                viewEmployeesByManager(managers, managersId)
                break;
            case 'Add Employee':
                managers.push("None");
                addEmployee(roles, rolesId, managers, managersId);
                break;
            case 'Remove Employee':
                removeEmployee(employees, employeesId);
                break;
            case 'Update Employee Role':
                updateEmployeeRole(roles, rolesId, employees, employeesId);
                break;
            case 'Update Employee Manager':
                managers.push("None");
                updateEmployeeManager(managers, managersId, employees, employeesId);
                break;
            case 'View All Roles':
                viewRoles();
                break;
            case 'Add Role':
                addRole(departments, departmentsId);
                break;
            case 'Remove Role':
                removeRole(roles, rolesId);
                break;
            case 'View All Departments':
                viewDepartments();
                break;
            case 'View the Total Utilized Budget of a Department':
                viewTotalUtilizedBudget(departments, departmentsId);
                break;
            case 'Add Department':
                addDepartment();
                break;
            case 'Remove Department':
                removeDepartment(departments, departmentsId)
                break;
            case 'Quit':
                console.log("Goodbye");
                console.log("==================================================================================================");
                db.end();
                break;
            default:
                console.log("There was an issue with the request.  Please try again.");
                return;
        }
    });
}

function viewAllEmployees() {
    db.query('SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(m.first_name, " ", m.last_name) AS manager FROM employee LEFT JOIN employee m ON employee.manager_id = m.id INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id ORDER BY employee.id', function(err, res) {
        console.table(res);
        mainPrompts();
    });
}

function viewEmployeesByDepartment(departments) {
    inquirer
    .prompt(
        {
            type: 'list',
            message: 'Which department would you like to see the employees for?',
            choices: departments,
            name: 'action'
        }
    )
    .then((response) => {
        console.log("==================================================================================================");

        db.query('SELECT employee.id, employee.first_name, employee.last_name, role.title FROM employee INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id WHERE department.name = ? ORDER BY employee.id', response.action, function(err, res){
            console.table(res);
            mainPrompts();
        })
    }); 
}

function viewEmployeesByManager(managers, managersId) {
    inquirer
    .prompt(
        {
            type: 'list',
            message: 'Which manager would you like to see the employees that work under them?',
            choices: managers,
            name: 'action'
        }
    )
    .then((response) => {
        console.log("==================================================================================================");
        let index = managers.indexOf(response.action)

        db.query('SELECT employee.id, employee.first_name, employee.last_name, role.title FROM employee INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id WHERE employee.manager_id = ? ORDER BY employee.id', managersId[index], function(err, res){
            if(!res[0]){
                console.log("There are no employees currently working under this manager.")
            } else {
                console.table(res);
            }
            mainPrompts();
        })
    });   
}

function addEmployee(roles, rolesId, managers, managersId) {
    inquirer
    .prompt([
        {
            type: 'input',
            message: `What is the new employee's first name?`,
            name: 'first'
        },
        {
            type: 'input',
            message: `What is the new employee's last name?`,
            name: 'last'
        },
        {
            type: 'list',
            message: `What is the employee's role?`,
            choices: roles,
            name: 'role'
        },
        {
            type: 'list',
            message: `Who is the employee's manager?`,
            choices: managers,
            name: 'manager'
        },

    ])
    .then((response) => {
        let roleIndex = roles.indexOf(response.role);
        let roleId = rolesId[roleIndex];
        let managerIndex;
        let managerId;

        if (response.manager != "None"){
            managerIndex = managers.indexOf(response.manager);
            managerId = managersId[managerIndex];
        } else {
            managerId = null;
        }

        db.query('INSERT INTO employee SET ?',
        {
            first_name: response.first,
            last_name: response.last,
            role_id: roleId,
            manager_id: managerId
        }, 
        function(err,res) {
            if (err) throw err;
        })

        console.log(`Successfully added ${response.first} ${response.last} to the database!`)
        
        mainPrompts();
    });  
}

function removeEmployee(employees, employeesId) {
    inquirer
    .prompt(
        {
            type: 'list',
            message: 'Which employee would you like to have removed?',
            choices: employees,
            name: 'action'
        }
    )
    .then((response) => {
        console.log("==================================================================================================");
        let employeeIndex = employees.indexOf(response.action);
        let employeeId = employeesId[employeeIndex];

        db.query('DELETE FROM employee WHERE employee.id = ?', employeeId, function(err, res){
            console.log(`${response.action} was successfully removed from the database`)
            mainPrompts();
        })
    });
}

function updateEmployeeRole(roles, rolesId, employees, employeesId) {
    inquirer
    .prompt([
        {
            type: 'list',
            message: 'Which employee would you like to update?',
            choices: employees,
            name: 'employee'
        },
        {
            type: 'list',
            message: 'Which role would you like for the employee to have?',
            choices: roles,
            name: 'role'
        },            
    ])
    .then((response) => {
        console.log("==================================================================================================");
        let employeeIndex = employees.indexOf(response.employee);
        let employeeId = employeesId[employeeIndex];
        let roleIndex = roles.indexOf(response.role);
        let roleId = rolesId[roleIndex];

        db.query('UPDATE employee SET ? WHERE ?', 
        [
            {
                role_id: roleId
            },
            {
                id: employeeId   
            }
        ],
         function(err, res){
            if (err) throw err;
            console.log(`${response.employee} was successfully updated`)
            mainPrompts();
        })
    });
}

function updateEmployeeManager(managers, managersId, employees, employeesId) {
    inquirer
    .prompt([
        {
            type: 'list',
            message: 'Which employee would you like to update?',
            choices: employees,
            name: 'employee'
        },
        {
            type: 'list',
            message: 'Which manager would you like for the employee to work under?',
            choices: managers,
            name: 'manager'
        },            
    ])
    .then((response) => {
        console.log("==================================================================================================");
        let employeeIndex = employees.indexOf(response.employee);
        let employeeId = employeesId[employeeIndex];
        let managerIndex;
        let managerId;

        if (response.manager != "None"){
            managerIndex = managers.indexOf(response.manager);
            managerId = managersId[managerIndex];
        } else {
            managerId = null;
        }


        db.query('UPDATE employee SET ? WHERE ?', 
        [
            {
                manager_id: managerId
            },
            {
                id: employeeId   
            }
        ],
         function(err, res){
            if (err) throw err;
            console.log(`${response.employee} was successfully updated`)
            mainPrompts();
        })
    });
}

function viewRoles() {
    db.query('SELECT role.id, role.title, role.salary, department.name FROM role INNER JOIN department ON role.department_id = department.id ORDER BY role.id', function(err, res) {
        console.table(res);
        mainPrompts();
    });
}

function addRole(departments, departmentsId) {
    inquirer
    .prompt([
        {
            type: 'input',
            message: `What is the title for the new role?`,
            name: 'title'
        },
        {
            type: 'input',
            message: `What is the salary for the new role?`,
            name: 'salary'
        },
        {
            type: 'list',
            message: `Which department does the new role fall under?`,
            choices: departments,
            name: 'department'
        }
    ])
    .then((response) => {
        let departmentIndex = departments.indexOf(response.department);
        let departmentId = departmentsId[departmentIndex];

        db.query('INSERT INTO role SET ?',
        {
            title: response.title,
            salary: response.salary,
            department_id: departmentId
        }, 
        function(err,res) {
            if (err) throw err;
        })

        console.log(`Successfully added the new role ${response.title} to the database!`)
        
        mainPrompts();
    });
}

function removeRole(roles, rolesId) {
    inquirer
    .prompt(
        {
            type: 'list',
            message: 'Which role would you like to have removed?',
            choices: roles,
            name: 'action'
        }
    )
    .then((response) => {
        console.log("==================================================================================================");
        let roleIndex = roles.indexOf(response.action);
        let roleId = rolesId[roleIndex];

        db.query('DELETE FROM role WHERE role.id = ?', roleId, function(err, res){
            console.log(`${response.action} was successfully removed from the database`)
            mainPrompts();
        })
    });
}

function viewDepartments() {
    db.query('SELECT * FROM department ORDER BY department.id', function(err, res) {
        console.table(res);
        mainPrompts();
    });
}

function viewTotalUtilizedBudget(departments, departmentsId) {
    inquirer
    .prompt([
        {
            type: 'list',
            message: `Which department would you like to see the total utilized budget for?`,
            choices: departments,
            name: 'department'
        }
    ])
    .then((response) => {
        let departmentIndex = departments.indexOf(response.department);
        let departmentId = departmentsId[departmentIndex];

        db.query('SELECT * from role where department_id = ?', departmentId, function(err,res) {
            let total = 0;
            res.forEach((item) => total += item.salary)
            console.log(`The total utilized budget for ${response.department} is $${total}.`);

            mainPrompts();
        })
    });
}

function addDepartment() {
    inquirer
    .prompt([
        {
            type: 'input',
            message: `What is the name of the new department?`,
            name: 'name'
        }
    ])
    .then((response) => {

        db.query('INSERT INTO department SET ?',
        {
            name: response.name,
        }, 
        function(err,res) {
            if (err) throw err;
        })

        console.log(`Successfully added the new department ${response.name} to the database!`)
        
        mainPrompts();
    });
}

function removeDepartment(departments, departmentsId) {
    inquirer
    .prompt(
        {
            type: 'list',
            message: 'Which department would you like to have removed?',
            choices: departments,
            name: 'action'
        }
    )
    .then((response) => {
        console.log("==================================================================================================");
        let departmentIndex = departments.indexOf(response.action);
        let departmentId = departmentsId[departmentIndex];

        db.query('DELETE FROM department WHERE department.id = ?', departmentId, function(err, res){
            console.log(`${response.action} was successfully removed from the database`)
            mainPrompts();
        })
    });
}

//Start application
title();