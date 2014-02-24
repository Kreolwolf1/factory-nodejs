---
Title: Validation in Node.js
Author: Pavel Voronin
DevCenter: Node.js
Section: Tutorials
Tags: Node.js, validator.js, browserify, grunt-browserify
---

{{tip "This page is currently under construction." type="danger"}}

{{header "Validation module provides a declarative way validation for express routes. It works as a standart middleware and allows validate requrest parameters before real action will be executed."}}

Validation module uses a [validator.js][1] libarary under the hood. So it's possible to use any validation rule that validation.js supports. (isEmail, isURL, isUUID, etc.)

Lets take a look how does it work:


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

You can include in **addValidation** function as many validation objects as you want and of course it can be used directry in the file where you declare routes.

```js
var krot = require('krot');
var express = require('express');

var addValidation = krot.validation.addValidation;
var app = express();

//apply standart middlewares (static, bodyParser, cookieParser) here
//....

app.post('/api/account', addValidation(
    {from: 'body.email', rule: 'isEmail'}
    {from: 'body.password', rule: 'isAlphanumeric'}
    {from: 'body.birth', rule: 'isDate'}
    {from: 'body.website', rule: 'isURL'}
), accountController.createAccount);
```

Also you can create your own validation rules and use them on a both backend and frontend sides.

1) Create separate file (e.g. **rules.js**) and put there your custom validation rules.

```js
//require validator library if you need it
var validator = require('validator');

//define rules container
var rules = {};

//define custom rule
//rule should return nothing if value is correct and error message if not
rules.isAccount = function (body) {
    if (!validator.isEmail(body.email) || validator.isAlphanumeric(body.password)) {
        return "Please provide correct data";
    }
}

module.exports = rules;
```
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

File with custom validation rules also can we exported to the frontend. To achieve this you should use [browserify grunt task][2] and avoid usage of node.js specific libraries in rules.js file. Keep in mind that [lodash][3], [util][4], [validator][5] and many other libraries and utilities can we easily processed via browserify.


  [1]: https://github.com/chriso/validator.js
  [2]: https://github.com/jmreidy/grunt-browserify
  [3]: http://lodash.com/
  [4]: http://nodejs.org/api/util.html
  [5]: https://github.com/chriso/validator.js