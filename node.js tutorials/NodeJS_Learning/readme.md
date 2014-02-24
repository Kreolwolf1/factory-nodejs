---
Title: Node.js Learning Resources
Author: Sergey Titov and Eugene Tsypkin
DevCenter: Node.js
Section: Tutorials
Tags: Node.js, NPM, Async, Callbacks, Learning, Resources
---



##Introduction

> Node.js is a platform built on Chrome's JavaScript runtime for easily building fast, scalable network applications. Node.js uses an event-driven, non-blocking I/O model that makes it lightweight and efficient, perfect for data-intensive real-time applications that run across distributed devices.

[nodejs.org](http://nodejs.org/)

Read the resources listed below to get general knowledge on Node.js; then proceed to the [Node.js Tutorials](#tutorials) section to find out how to develop Node.js applications on our platform.

## Installation

Go to http://nodejs.org/, download Node.js installer and follow instructions. Mac OS, Windows, and Linux are supported.

## JavaScript

To use Node.js, you need to have a decent understanding of the JavaScirpt language.

- [Crockford's videos](http://yuiblog.com/crockford/)
- [Eloquent JavaScript](http://eloquentjavascript.net/)
- [Essential JavaScript Design Patterns For Beginners](http://www.addyosmani.com/resources/essentialjsdesignpatterns/book/)
- [Understand JavaScript Closures With Ease](https://gibbon.co/paptamas/javascript-concepts/understand-javascript-closures-with-ease)
- [JavaScript Garden](http://bonsaiden.github.com/JavaScript-Garden/)
- [JavaScript Patterns Book](http://oreilly.com/catalog/9780596806767)
- [JavaScript: The Good Parts Book](http://oreilly.com/catalog/9780596517748/)
- [JavaScript Promises](http://www.html5rocks.com/en/tutorials/es6/promises/)

## Node.js Fundamentals

- [Node.js FUNdamentals: a Concise Overview of the Main Concepts](http://webapplog.com/node-js-fundamentals-a-concise-overview-of-the-main-concepts)
- Why Node.js:
    - [Why the Hell Would I Use Node.js? A Case-by-Case Introduction](http://www.toptal.com/nodejs/why-the-hell-would-i-use-node-js)
    - [Why I use Node.js?](http://pettergraff.blogspot.com/2013/01/why-node.html)
    - [PHP vs. Node.js](http://webapplog.com/php-vs-node-js/)
- Migrating to Node.js:
    - [Dismantling the Monoliths](https://engineering.groupon.com/2013/misc/i-tier-dismantling-the-monoliths/)
    - [Node.js at PayPal](https://www.paypal-engineering.com/2013/11/22/node-js-at-paypal/)
- [Official documentation](http://nodejs.org/api/)
- CommonJS module system:
    - http://docs.nodejitsu.com/articles/getting-started/what-is-require)
    - http://pages.citebite.com/i9e9e4d1yxip
- [Node.js modules official documentation](http://nodejs.org/api/modules.html)
- [Managing module dependencies](http://howtonode.org/managing-module-dependencies)
- [Using Node.js Event Module](http://code.tutsplus.com/tutorials/using-nodes-event-module--net-35941)
- [Understanding exports vs. module.exports](http://openmymind.net/2012/2/3/Node-Require-and-Exports/)
- [Managing Configurations in Node.js](/docs/nodejs/tutorials/managing_configurations_in_nodejs)


## Asynchronous Programming

- [Understanding the node.js event loop](http://blog.mixu.net/2011/02/01/understanding-the-node-js-event-loop/)
- [Control flow in Node.js](http://book.mixu.net/node/ch7.html)
- [Managing Node.js Callback Hell with Promises, Generators and Other Approaches](http://strongloop.com/strongblog/node-js-callback-hell-promises-generators/?utm_source=nodeweekly&utm_medium=email)

- Async:
    - [Avoiding Callback Hell with Async.js](http://www.slideshare.net/cacois/avoiding-callback-hell-with-asyncjs)
    - [Node.js Async Programming](http://www.hacksparrow.com/node-js-async-programming.html)
- Promises:
    - [Asynchronous Control Flow with Promises](http://howtonode.org/promises)
    - [Promises with Q](http://www.slideshare.net/async_io/javascript-promisesq-library-17206726)
- [ES6 Generators and Preventing Callback Hell](http://www.sitepoint.com/javascript-generators-preventing-callback-hell/)


## Node Package Manager (npm)

- [What is NPM?](http://docs.nodejitsu.com/articles/getting-started/npm/what-is-npm)
- [Introduction to npm](http://howtonode.org/introduction-to-npm)
- Explore [registered public npm modules](https://npmjs.org/)
- [How to publish your module to npm?](https://gist.github.com/coolaj86/1318304)
- Node.js tips and tricks:
    - [9 Quick Tips about NPM](http://blog.ponyfoo.com/2013/12/14/9-quick-tips-about-npm)
    - [NPM tricks](http://www.devthought.com/2012/02/17/npm-tricks/)
    - [Task automation with npm run](http://substack.net/task_automation_with_npm_run)
- Private NPM approaches:
    - [How to create a private npm.js repository](http://clock.co.uk/tech-blogs/how-to-create-a-private-npmjs-repository)
    - [A hierarchical npm-registry proxy that allows to support private npm repos without replicating the entire public registry](https://github.com/paypal/kappa)
    - [A lazy local cache for npm](https://github.com/mixu/npm_lazy)




## Free Books

- [The Node Beginner Book](http://www.nodebeginner.org/#about)
- [The Art of Node](https://github.com/maxogden/art-of-node)
- [JavaScript and Node FUNdamentals](https://leanpub.com/jsfun/read)
- [Mixu's Node book](http://book.mixu.net/node/)

## Paid Books

- [Node.js in Action](http://www.amazon.com/Node-js-Action-Mike-Cantelon/dp/1617290572/ref=sr_1_1?s=books&ie=UTF8&qid=1391739265&sr=1-1&keywords=%22node.js%22)
- [JavaScript on the Server Using Node.js and Express](http://www.amazon.com/JavaScript-Server-Node-js-Express-Development/dp/0956737080/ref=sr_1_20?s=books&ie=UTF8&qid=1391739340&sr=1-20&keywords=%22node.js%22)
- [Express.js Guide](http://www.amazon.com/Express-js-Guide-Comprehensive-Book/dp/1494269279/ref=sr_1_2?s=books&ie=UTF8&qid=1391740486&sr=1-2&keywords=%22node.js%22+express)

## Frameworks

- Sinatra like:
    - [connect](https://github.com/senchalabs/connect) - an extensible HTTP server framework for Node.js using "plugins" known as middleware.
    - [express.js](http://expressjs.com/guide.html) - a Sinatra inspired Web development framework for Node.js.
    - [hapi](https://github.com/spumko/hapi) - a rich framework for building Web applications and services.
    - [express.io](https://github.com/techpines/express.io) = Express + Socket.io.
    - [koa](https://github.com/koajs/koa) - an expressive middleware for Node.js using generators.
    - [Flatiron](https://github.com/flatiron/flatiron) - framework components for Node.js and a browser.
    - [total.js](https://github.com/totaljs/framework) - a Web application framework for creating rich Web sites and Web services.
- MVC:
    - [Geddy](http://geddyjs.org) - a simple, structured Web framework for Node.js.
    - [Sails.js](http://sailsjs.org) - a realtime MVC Framework for Node.js.
    - [Compound](http://compoundjs.com/) - the compound formula is Express + Structure + Extensions.    
- Full stuck:
    - [meteor.js](https://github.com/meteor/meteor) - Meteor is an ultra-simple environment for building modern Web applications. Built using Node.js, Meteor is a framework on its own. Please see an [amazing list of Meteor resources](http://yauh.de/articles/376/best-learning-resources-for-meteorjs) for more information.
    - [Derby](https://github.com/codeparty/derby) - the MVC framework making it easy to write realtime, collaborative applications that run in both Node.js and browsers.
    - [SocketStream](https://github.com/socketstream/socketstream) - A fast, modular Node.js Web framework dedicated to building realtime single-page applications.

If you would like to learn more about Node.js frameworks, please visit [nodeframework.com](http://nodeframework.com/) and [nodewebmodules.com](http://nodewebmodules.com).


## Libraries

- [socket.io](https://github.com/LearnBoost/socket.io) - a realtime application framework for Node.JS, with HTML5 WebSockets and cross-browser fallbacks support.
- [mongoose](https://github.com/LearnBoost/mongoose) - MongoDB object modeling designed to work in an asynchronous environment.
- [winston](http://github.com/flatiron/winston) - a multi-transport asynchronous logging library for Node.js
- [passport](https://github.com/jaredhanson/passport) - simple, unobtrusive authentication for Node.js.
- [async](https://github.com/caolan/async) - asynchronous utilities for Node and the browser.
- [Q](https://github.com/kriskowal/q) - a tool for making and composing asynchronous promises in JavaScript.
- [co](https://github.com/visionmedia/co) - the ultimate generator based flow-control goodness for nodejs;
- [jade](https://github.com/visionmedia/jade) - Jade - a robust, elegant, feature-rich template engine for Node.js.
- [ejs](https://github.com/visionmedia/ejs) - embedded JavaScript templates for Node.js.
- [lodash](https://github.com/lodash/lodash) - a utility library delivering consistency, customization, performance, and extras.
- [request](https://github.com/mikeal/request) - a simplified HTTP request client.
- [config](https://github.com/lorenwest/node-config) - a runtime configuration for Node.js. modules.



## Testing

Read about various approaches to testing Node.js code:

- [Testing in Node.js](http://code.tutsplus.com/tutorials/testing-in-nodejs--net-35018)
- [Testing NodeJS with Mocha, Should, Sinon, and JSCoverage](http://www.slideshare.net/mlilley/testing-node-js-with-mocha)
- [Setting up Mocha and JSCoverage](http://www.seejohncode.com/2012/03/13/setting-up-mocha-jscoverage/)
- [Acceptance testing with supertest](http://www.scotchmedia.com/tutorials/express/authentication/2/02)
- [Testing node.js applications with Jasmine](http://blog.codeship.io/2013/08/20/testing-tuesday-19-how-to-test-node-js-applications-with-jasmine.html)
- [Mocking Dependencies using [rewire]](http://howtonode.org/mocking-private-dependencies-using-rewire)

Learn **how we do it** using the following frameworks:

- [mocha](https://github.com/visionmedia/mocha) -  a simple, flexible JavaScript test framework for Node.js and a browser. (BDD, TDD, QUnit styles via interfaces).
- [jasmin-node](https://github.com/mhevery/jasmine-node) - integration of the Jasmine Spec framework with Node.js.
- [sinon](https://github.com/cjohansen/Sinon.JS) - test spies, stubs, and mocks for JavaScript.
- [chai](https://github.com/chaijs/chai) - a BDD / TDD assertion framework for Node.js and a browser. 
- [supertest](https://github.com/visionmedia/supertest) - a super-agent driven library for testing Node.js HTTP servers using a fluent API.
- [rewire](https://github.com/jhnns/rewire) - a dependency injection for Node.js applications.
- [node-jscoverage](https://github.com/visionmedia/node-jscoverage) - JSCoverage for Node.js.

## Keeping up to Date

### What To Read

- ["How To Node" blog](http://howtonode.org/)
- [Google Node.js Group](https://groups.google.com/forum/#!forum/nodejs)
- [Google Node.js Community](https://plus.google.com/communities/115365528781941125390)
- [Node.js on Reddit](http://www.reddit.com/r/node/)
- [Stackoverflow Node.js tag](http://stackoverflow.com/questions/tagged/node.js)
- IRC - for real-time chatting about Node.js development go to **irc.freenode.net** in the **node.js** channel with an [IRC client](http://colloquy.info/) or connect in your Web browser to the channel using [freenode's WebChat](http://webchat.freenode.net/?channels=node.js).
- [Node.js Weekly](http://nodeweekly.com/) - an email list that gathers up the latest events and news from around the Node.js community.
- [NodeUp](http://nodeup.com/) - a podcast covering the latest Node.js news in the community.

### Who to Follow

- [TJ Holowachuk](https://github.com/visionmedia) - Express, Jade, Mocha, Stylus
- [Isaac Z. Schlueter](https://github.com/isaacs) - Node.js / NPM maintainer  
- [Mikeal Rogers](https://github.com/mikeal) - Request
- [James Haliday "substack"](https://github.com/substack) - Browserify, DNode, Optimist
- [Guillermo Rauch](https://github.com/guille) - Socket.IO


## <a id="tutorials"></a>Node.js Tutorials

Now when you are familiar with Node.js, you can learn how to develop applications with Node.js on our platform:    

- [Node.js tutorials](http://devportal.devportal-ci.dspdev.wmg.com/docs/nodejs/nodejs_components/authentication_module)  
- [Node school](http://nodeschool.io/)
- [Real time Web with Node.js](https://www.codeschool.com/courses/real-time-web-with-nodejs)


