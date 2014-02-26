---
Title: Validation in Node.js
Author: Pavel Voronin
DevCenter: Node.js
Section: Tutorials
Tags: Node.js, Validator.js, Express.js, grunt-browserify
---



##Introduction

The *Validation* module provides a declarative way of validating routes in Express.js. It works as a standard middleware and allows validating request parameters before a real action is executed.

The *Validation* module uses the [validator.js][1] library under the hood. So it is possible to use any validation rule that **validator.js** supports. (**isEmail**, **isURL**, **isUUID**, etc.).





##Validation Module API

The *Validation* module is available in the **krot** library:


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

The **addValidation** method is a convenient decorator that returns a middleware validation function. It is possible to provide the **addValidation** function with two types of arguments:

1. [Validation object](#jbject);
2. [Custom validation function](#function).


###<a id="object"></a> Validation Object

```js
addValidation({from: 'body.email', rule: ['isEmail', 'isLowercase'], required: false, error: "Email is required"});
```



Property               | Description
---------              | -----
**from**: (*String*)   | A property that will be taken from the request object and validated according to the rule.
**rule**: (*String*) | The name of a validation rule in the [validator.js][1] library. If the rule property is omitted, than the **from** parameter value will be validated by the default rule (a value have to be indicated in the request object).
**required**: (*Bool*) | If a value is not strictly required, it will be validated only when it is found in the request object.
**error**: (*String*) | A custom validation message.




###<a id="function"></a> Custom Validation Funciton
```js
addValidation(function (req, res) {/*validation rule goes here*/});
```
You can use a request parameter in Express.js to obtain a necessary value.
The validation function should return **null** if the validated value is correct or an error message if it is not.   


{{tip "Validation functions and objects can be used together." type="info"}}

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

##Using Validation Middleware

Below is a standard **router.js** file with a list of all application routes:

```js
var accountController = require('./accountController');

app.post('/api/account', accountController.createAccount);
app.get('/api/account/:id', accountController.getAccount);
app.update('/api/account/:id', accountController.updateAccount);
app.delete('/api/account/:id', accountController.deleteAccount);
```

The **accountController.js** file contains the endpoint implementation:

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

##Creating Custom Rules

You can use validation rules not only inside the **addValidation** function. You can also create your own custom validation rules and then use them anywhere.

1) Create a separate file (for example, **rules.js**) and put there your custom validation rules.


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

> **Note**: The above-stated validation rule should return **null** if the validated value is correct or an error message if it is not..

2) Add your custom rules to the validation middleware:

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

##Exporting Rules to the Frontend

You can export the file with your custom validation rules to the frontend. For this purpose, you need to use the [browserify grunt][2] task and, at the same time, avoid using any of Node.js specific libraries in the **rules.js** file.

Take into account that [lodash][3], [util][4], [validator.js][5] and a lot of other libraries and utilities can be easily processed via **browserify**.  

If you would like to apply validator.js rules to the frontend, you can use the next trick:

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
