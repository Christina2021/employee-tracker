const mysql = require("mysql");
const inquirer = require("inquirer");
const logo = require("asciiart-logo");
const config = require('./package.json');
const connection = require('./db/connection.js');

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
        switch (response.action) {
            case 'View All Employees':
                break;
            case 'View All Employees By Department':
                break;
            case 'View All Employees By Manager':
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
                break;
            default:
                console.log("There was an issue with the request.  Please try again.");
                return;
        }
    })
};