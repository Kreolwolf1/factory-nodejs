---
Title: Error Handling in Node.js
Author: Eugene Tsypkin
DevCenter: Node.js
Section: Tutorials
Tags: Node.js, Error, Unhandled Exception, Error Handling, Express Framework
---


##Introduction

When programming in the Node.js environment, you will definitely encounter two types of exceptions: 
- uncaught exceptions;
- exceptions caused by our code.

In this tutorial, we are going to explain to you how you can handle such errors.  

## Caught Exceptions in the Express Framework

In the process of developing an application, you should regularly check for errors and return error information to the frontend if necessary.  

<a id="first"></a> Take a look at the following example:

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

As you can see, after starting the server and making a request to localhost **5000**, you will get an error description. 

We expect error handling in our application:
- to store all the logic for displaying errors in one place;
- to log every error;
- to implement a different method of error handling based on **NODE_ENV**.

The *Express* framework provides you with the ability to specify the middleware that will handle all errors in one place. So let us rewrite our application:

{{code js="\livedemo\expressErrorHAndling.js" js_rows="15-37, 44"}}



As you can see from the example above, we have specified all the actions that we need to take after an error has occurred in the middleware. 

If you need to add you own custom logic, you can specify a different middleware with it. You can also customize ` statusCode ` inside each route (by default, it is **500**).


```
    app.get('/', function (req, res, next) {
        return next({statusCode: 400, message: 'foo bar'})
    });
```

If you replace the route from the [first example](#first) with this one, you will get ` statusCode ` **400** in response.


## Uncaught Exceptions

The following code illustrates a simple example of an uncaught exception:



```
    // app.js file
    var errorFunction = function () {
        var error = new Error('example');
        throw error;
    };

    errorFunction();
    console.log('The end');
```

Now when you have executed this code with Node.js, you will get output that is similar to this:

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
As you can see, our process is interrupted with an error.
The same behavior will occur when a large application handles a lot of online connections.


### Try Catch Method

If your code is synchronous, it is quite easy to handle this situation: you can just use the **try catch** method for this purpose.



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

However, the point is that everything in Node.js is asynchronous and **try catch** cannot help you in this case.

Let us look at an asynchronous example:

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

You can see that our process failed with an error.

### Uncaught Exception Handler


Node.js provides you with the ability to invoke an error handler after an uncaught exception has taken place: for this purpose, you can attach your exception handler to the ** uncaughtException** event of the process object.    

Let us assume that we have a simple Node.js application:



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

If you make a browser request to localhost 5000, you can see an error message in the console. However, you will also see a **foobar** response in your browser and realize that our server has not actually failed and still can send responses. 
Since the process does not crash, which can lead to a memory leak, this approach cannot be regarded as an effective one.    

The most effective approach is to log an error, “kill” the process after that, and then restart the process, using a tool such as the [forever](https://github.com/nodejitsu/forever) module. 




### Use of Winston **handleExceptions** Method


Using the [Winston](https://github.com/flatiron/winston) logger will help you easily specify how to log uncaught exceptions.

Take a look at the following code:





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


After the above code has been executed, you will find all information relating to errors in the **app.log** file. The **handleExceptions** method also “kills” the process automatically.

Using this approach, you can easily change the logging destination by changing the file transport to one of the [existing ones](https://github.com/flatiron/winston/blob/master/docs/transports.md). 

You can also [create your own transport](https://github.com/flatiron/winston#adding-custom-transports) with your own custom logic.





### Using Domains

Starting with Node.js Version **0.10**, you can use the built-in [domain](http://nodejs.org/api/domain.html) module to solve the problem of error handling.

This is an extract from the API documentation: "Domains provide a way to handle multiple different IO operations as a single group. If any of the event emitters or callbacks registered to a domain emit an error event, or throw an error, then the domain object will be notified, rather than losing the context of the error in the process.on('uncaughtException') handler, or causing the program to exit immediately with an error code."

This is an example of rewriting our server with domain usage:


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
In this case the behavior is the same as with ` process.on('uncaughtError') `. The main benefit of using domains is that you can get the context in which errors occur. 

{{tip "Nevertheless, you still need to crash the process in order to avoid memory leaks. " type="warning"}}

For information about how to combine domains with the [cluster](http://nodejs.org/api/cluster.html) module to implement graceful degradation after an exception, refer to this [tutorial](http://nodejs.org/api/domain.html#domain_warning_don_t_ignore_errors).  


