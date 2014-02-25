'use strict';
var fs = require('fs');
var inspect = require('util').inspect;
var winston = require('winston');
var express = require('express');
var app = express();

//check if json accepted
var isAcceptJSON = function (accepted) {
    return accepted.some(function (item) {
        return (item.subtype === 'json');
    });
};

// add middleware with 4 parameters first of them
// is error that means that
app.use(function (err, req, res, next) {
    //log error using winston
    winston.error(err);
    var statusCode = err.statusCode || 500;
    var message = err.message || err;

    //return error in json if X-Requested-With header exists or
    // if json is in the accepted header
    if (req.xhr || isAcceptJSON(req.accepted)) {
        return res.json(statusCode, {error: message});
    }

    //return inspected error object if NODE_ENV is not equal production
    if (process.env.NODE_ENV !== 'production') {
        return res.send(statusCode, inspect(err));
    }

    // return some default message if the env is production
    // here you can render static error page
    res.send(statusCode, 'Internal Server Error');
});


app.get('/', function(req, res, next){
    fs.readFile('./wrong.name', function (err, result) {
        if (err) {
            // pass error object to our middleware handler
            return next(err);
        }
        res.send(result);
    });
});

app.listen(5000);