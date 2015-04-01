Reverse Line Reader [![Build Status](https://secure.travis-ci.org/paul-em/reverse-line-reader.png?branch=master)](http://travis-ci.org/paul-em/reverse-line-reader)
===========

Asynchronous reverse line-by-line file reader. This started as a fork of Nick Ewing's [line-reader](https://github.com/nickewing/line-reader). Major parts are rewritten to read the file from bottom to top, but the api works more or less the same.

Install
-------

`npm install reverse-line-reader`

Usage
-----

The `eachLine` function reads each line of the given file.  Upon each new line,
the given callback function is called with two parameters: the line read and a
boolean value specifying whether the line read was the last line of the file (on the top of the file).
If the callback returns `false`, reading will stop.

    var lineReader = require('reverse-line-reader');

    lineReader.eachLine('file.txt', function(line, last) {
      console.log(line);

      if (/* done */) {
        return false; // stop reading
      }
    });

`eachLine` can also be used in an asynchronous manner by providing a third
callback parameter like so:

    var lineReader = require('reverse-line-reader');

    lineReader.eachLine('file.txt', function(line, last, cb) {
      console.log(line);

      if (/* done */) {
        cb(false); // stop reading
      } else {
        cb();
      }
    });

The `eachLine` function also returns an object with one property, `then`.  If a
callback is provided to `then`, it will be called once all lines have been read.

    var lineReader = require('reverse-line-reader');

    // read all lines:
    lineReader.eachLine('file.txt', function(line) {
      console.log(line);
    }).then(function () {
      console.log("I'm done!!");
    });


Contributors
------------

* Paul Em
* Nick Ewing
* Jameson Little (beatgammit)

Copyright 2015 Paul Em.
