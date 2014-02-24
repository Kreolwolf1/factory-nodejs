---
Title: Error Handling in node.js
Author: Eugene Tsypkin
DevCenter: Node.js
Section: Tutorials
Tags: Node.js, errors, uncought error, error handling
---

##Introduction

While programming in the node.js environment you defiantly will face with two types of exceptions: uncaught exceptions
and exceptions that are provided by our code. In this tutorial we will describe how you can handle with all of them.

## Handling caught exceptions in express framework

While developing an application we always face with some actions after those we have to check errors and return information
about it to frontend. Take a look to following example
```
var fs = require('fs');
var express = require('express');
var app = express();

app.get('/', function(req, res){
    fs.readFile('./wrong.name', function (err, result) {
        if (err) {
            return res.send(500, err);
        }
        res.send(result);
    });
});

app.listen(5000);
```

So after starting this server and requesting localhost:5000 you will get an error description. What we need from exception handling
in our application:
- to have all error displaying logic in one place
- to log every error
- to implement different behavior of error handling based on NODE_ENV

Express provide us the possibility to specify a middleware that could handle all errors in one place. So lets rewrite our application:
{{code js="/expressErrorHAndling.js" js_rows="15-37, 44"}}

As you see at this example we specify all our actions that we do after errors in middleware. If you need to add you custome logic you can also specify anther middleware with it inside. Also you can customize statusCode inside each route(By default it is 500)
```
    app.get('/', function (req, res, next) {
        return next({statusCode: 400, message: 'foo bar'})
    });
```

If you substitute route from first example by this one you will get 400 status code in response.


## Uncaught Exceptions
You can see a simple example of uncaught exception in following code

```
    // app.js file
    var errorFunction = function () {
        var error = new Error('example');
        throw error;
    };

    errorFunction();
    console.log('The end');
```

Now if you execute this code with node you get the such output like this one
```
    node app.js

    /Path/to/file/app.js:3
        throw error;
              ^
    Error: example
        at errorFunction (/Path/to/file/app.js:2:17)
        at Object.<anonymous> (/Path/to/file/app.js:6:1)
        at Module._compile (module.js:456:26)
        at Object.Module._extensions..js (module.js:474:10)
        at Module.load (module.js:356:32)
        at Function.Module._load (module.js:312:12)
        at Function.Module.runMain (module.js:497:10)
        at startup (node.js:119:16)
        at node.js:901:3
```
Soo as you can see our process was interrupted with error and we have not seen an 'The end' log.
The same behavior you will see with big application that handles a lot of online connections.

### Try than catch
So if your code is synchronous it is quite easy to handle this situation you can use ##try catch## for it.

```
    var errorFunction = function () {
        var error = new Error('example');
        throw error;
    };

    try {
        errorFunction();
    } catch (e) {
        console.log(e);
    }
    console.log('The end');

    // node app.js

    [Error: example]
    The end
```

Now everything is cool but in node.js everything is asynchronous and in this case ###try catch### could not help you.

Lets look on async example
```
    var errorFunction = function (callback) {
        process.nextTick(function () {
            var error = new Error('example');
            throw error;
            callback();
        });
    };


    try {
        errorFunction(function () {
            console.log('the end');
        });
    } catch (e) {
        console.log(e);
    }

    //node app.js

    /Path/to/file/app.js:4
            throw error;
                  ^
    Error: example
        at /Path/to/file/app.js:3:21
        at process._tickCallback (node.js:415:13)
        at Function.Module.runMain (module.js:499:11)
        at startup (node.js:119:16)
        at node.js:901:3
```

So as you see our process fall with error.

### Uncaught Exception handler

In this situation node.js gets as a possibility to invoke our handler after
uncaught exception happened to do this you have to add your handler to uncaughtException event of process object.
Lets assume that we have a simple node.js app:

```
'use strict'

var errorFunction = function () {
    process.nextTick(function () {
        var error = new Error('example');
        throw error;
    });
};

process.on('uncaughtException', function (error) {
    console.log(error);
});

require('http').createServer(function(req, res) {
    errorFunction();
    res.write('Foo bar');
    res.end();
}).listen(5000);
```

If you request with browser localhost:5000 you could see an error message in console but you still could see a foo bar
response in browser and You can noticed that our server has not fall and still could send responses. But it is not really great idea.
Because if the process does not crash after error it defiantly could lead to memory leak. The good approach is to log error, kill the process after
it and then restart it using some thing like [forever](https://github.com/nodejitsu/forever) module.


### Use winston handleExceptions method
If you use [winston](https://github.com/flatiron/winston) logger it helps you easily specify how to log uncaught exceptions
take a look on following code

```
var winston = require('winston');

var errorFunction = function () {
    process.nextTick(function () {
        var error = new Error('example');
        throw error;
    });
};

//init handleExeptions with file transport
winston.handleExceptions(new winston.transports.File({
    filename: 'app.log', //file name where to find the logs
    json: false  // do not use json format for log message
}));

require('http').createServer(function(req, res) {
    errorFunction();
    res.write('Foo bar');
    res.end();
}).listen(5000);
```

After executing this example you could find all information about error in app.log. Also handleExceptions method kills process automatically.
So using this approach you could easily change the logging destination by changing the File transport on the one of
[already existing](https://github.com/flatiron/winston/blob/master/docs/transports.md) Also you can [create your own transport](https://github.com/flatiron/winston#adding-custom-transports) with your custom logic

### Using domains

Since node version 0.10 you can use a builtin [domain](http://nodejs.org/api/domain.html) module in order to solve a problem with error Handling.
From api documentation: "Domains provide a way to handle multiple different IO operations as a single group. If any of
the event emitters or callbacks registered to a domain emit an error event, or throw an error, then the domain object will be notified,
rather than losing the context of the error in the process.on('uncaughtException') handler, or causing the program to exit immediately with an
error code."

So here our small server that rewriting with domain usage
```
var d = require('domain').create();

var errorFunction = function () {
    process.nextTick(function () {
        var error = new Error('example');
        throw error;
    });
};

d.on('error', function (error) {
    console.log(error);
});

d.run(function () {
    require('http').createServer(function(req, res) {
        errorFunction();
        res.write('Foo bar');
        res.end();
    }).listen(5000);
});
```
In this case the behavior is the same as with process.on('uncaughtError') the main benefit is that you can get the context
in which error happened. Despite it you still need to crash process in order to avoid memory leaks. In this [tutorial](http://nodejs.org/api/domain.html#domain_warning_don_t_ignore_errors)
you can find how to combine domains with [cluster](http://nodejs.org/api/cluster.html) module in order to
implement graceful degradation after exception
