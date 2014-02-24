---
Title: Validation in Node.js
Author: Pavel Voronin
DevCenter: Node.js
Section: Tutorials
Tags: Node.js, validator.js, browserify, grunt-browserify
---

{{tip "This page is currently under construction." type="danger"}}

##Introduction

Validation module provides a declarative way validation for express routes. It works as a standart middleware and allows validate requrest parameters before real action will be executed.

Validation module uses a [validator.js][1] libarary under the hood. So it's possible to use any validation rule that validation.js supports. (isEmail, isURL, isUUID, etc.)

##Validation module api

Validation module avaliable from the krot library:

```js
    var krot = require('krot');
    var addValidation = krot.validation.addValidation;
    
    //application creation goes here
    
    app.post('/api/account', addValidation(
        {from: 'body.password', rule: 'isAlphanumeric'}
    ), function (req, res) {
        //controller action goes here
    });
    
```

**addValidation** is a convenient decorator, that returns middleware validation function. It is possible provide to addValidation function two types of arguments:

1. Validation object
2. Custom validation function

####Validation object

```js
addValidation({from: 'body.email', rule: ['isEmail', 'isLowercase'], required: false, error: "Email is required"});
```
**from** (*String*): property that will be taken from the request object and validated according to the rule.

[**rule** (*String*)]: name of validation rule in validation.js library. If "rule" property is omitted than "from" value will be validated by default rule (value have to be present in request object)

[**required** (*bool*)]: If value is not strictly required it will be validated only if it is exist in request object.

[**error** (*String*)]: Custom validation message. 

####Custom validation funciton
```js
addValidation(function (req, res) {/*validation rule goes here*/});
```
Inside custom validation function you can use express request param to obtain a nessesary value. Validation function should return nothing if validated value is correct and error message if it's not.

{{tip "Validation functions and objects can be used together" type="info"}}

```js
var krot = require('krot');
var express = require('express');

var addValidation = krot.validation.addValidation;
var app = express();

//apply standart middlewares (static, bodyParser, cookieParser) here
//....

app.post('/api/account', addValidation(
    //simpe validation object
    {from: 'body.password', rule: 'isAlphanumeric'},
    //validation object with 2 rules
    {from: 'body.email', rule: ['isEmail', 'isLowercase']},
    //body.birth is not strictly required, but if it exist it should be a date.
    {from: 'body.birth', rule: 'isDate', required: false},
    //custom validation rule
    function (req) {
        if (!req.body.website) {
            return "Website parameter is required!";
        }
    }
), accountController.createAccount);
```

##Using validation middleware

Here we have a standart **router.js** file with a list of all application routes in one file:

```js
var accountController = require('./accountController');

app.post('/api/account', accountController.createAccount);
app.get('/api/account/:id', accountController.getAccount);
app.update('/api/account/:id', accountController.updateAccount);
app.delete('/api/account/:id', accountController.deleteAccount);
```

**accountController.js** file contains an appropriate endpoints implementation:

```js
//require krot library
var krot = require('krot');

//save addValidation function to separate variable for suitable usage
var addValidation = krot.validation.addValidation;

exports.createAccount = [
    //inject validation middleware
    addValidation(
        //from is a property that will be taken from the request object and validated according to the rule
        //rule is a name of validation rule in validation.js library 
        {from: 'body.email', rule: 'isEmail'}
        {from: 'body.password', rule: 'isAlphanumeric'}
    ),
    function (req, res, next) {
        //here we 100% sure that email and password already have correct values
        var email = req.body.email
        var password = req.password.email
        
        //business logic goes here
        //....
    }
];

exports.getAccount = [
    addValidation(
        {from: 'params.id', rule: 'isUUID'}
    ),
    function (req, res, next) {
        //business logic goes here
        //....
    }
]
```

##Creating custom rules

Also you can use validation rules not only inside addValidation function. You can declare custom validation rules once and then use them anywhere.

1) Create separate file (e.g. **rules.js**) and put there your custom validation rules.

```js
//require validator library if you need it
var validator = require('validator');

//define rules container
var rules = {};

//define custom rule
rules.isAccount = function (body) {
    if (!validator.isEmail(body.email) || validator.isAlphanumeric(body.password)) {
        return "Please provide correct data";
    }
}

module.exports = rules;
```
Notice that validation rule should return nothing if validated value is correct and error message if it's not.

2) Add your custom rules to the validation middleware

```js
//require krot libarary
var krot = require('krot');
var validation = krot.validation;
var addValidation = validation.addValidation;

//require custom rules.js file
var rules = require('./rules');

//set rules to the validation library
validation.setRules(rules);

//apply custom validation rule to the route
app.post('/api/account', addValidation(
    {from: 'body', rule: 'isAccount'}
), accountController.createAccount);
```

##Exporting rules to the front-end

File with custom validation rules also can we exported to the front-end. To achieve this you should use [browserify grunt task][2] and avoid usage of node.js specific libraries in rules.js file. Keep in mind that [lodash][3], [util][4], [validator][5] and many other libraries and utilities can we easily processed via browserify.
If you want apply validator.js rules on front-end you can use next trick.

```js
var validator = require('validator');

var rules = Object.create(validator);

module.exports = rules;
```

  [1]: https://github.com/chriso/validator.js
  [2]: https://github.com/jmreidy/grunt-browserify
  [3]: http://lodash.com/
  [4]: http://nodejs.org/api/util.html
  [5]: https://github.com/chriso/validator.js