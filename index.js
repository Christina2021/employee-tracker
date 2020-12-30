const mysql = require("mysql");
const inquirer = require("inquirer");
const logo = require("asciiart-logo");
const config = require('./package.json');
const db = require('./db/connection.js');
const cTable = require('console.table');

//Using asciiart-logo for a title
//Used npm documentation in which the console will display the name, version, and description.
function title() {
    console.log(logo(config).render());
    //Start prompts
    mainPrompts();
}

title();

function mainPrompts() {
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

        switch (response.action) {
            case 'View All Employees':
                viewAllEmployees();
                break;
            case 'View All Employees By Department':
                viewEmployeesByDepartment();
                break;
            case 'View All Employees By Manager':
                viewEmployeesByManager()
                break;
            case 'Add Employee':
                break;
            case 'Remove Employee':
                break;
            case 'Update Employee Role':
                break;
            case 'Update Employee Manager':
                break;
            case 'View All Roles':
                break;
            case 'Add Role':
                break;
            case 'Remove Role':
                break;
            case 'View All Departments':
                break;
            case 'View the Total Utilized Budget of a Department':
                break;
            case 'Add Department':
                break;
            case 'Remove Department':
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
    })
}

function viewAllEmployees() {
    db.query('SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(m.first_name, " ", m.last_name) AS manager FROM employee LEFT JOIN employee m ON employee.manager_id = m.id INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id ORDER BY employee.id', function(err, res) {
        console.table(res);
        mainPrompts();
    });
}

function viewEmployeesByDepartment() {
    let departments = [];

    //Takes all departments from table to be displayed as choices
    db.query('SELECT * FROM department', function(err,res){
        res.forEach((item) => {
            departments.push(item.name);
        })

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
        })    
    });
}

function viewEmployeesByManager() {
    let managers = [];
    let managersId = [];

    //Takes all managers (based on those who do not report to a manager) from table to be displayed as choices
    db.query('SELECT * FROM employee', function(err,res){

        res.forEach((item) => {
            if(!item.manager_id) {
                managers.push(item.first_name + " " + item.last_name);
                managersId.push(item.id);
            }
        })

        console.log(managers);
        console.log(managersId);

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
                console.table(res);
                mainPrompts();
            })
        })    
    });
}

