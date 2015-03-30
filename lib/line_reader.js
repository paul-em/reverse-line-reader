var i = 0;
(function () {
  "use strict";
  var fs = require('fs');
  var noop = function () {
  }

  function LineReader(filename, separator, encoding, chunkSize) {
    this.size = fs.statSync(filename).size;
    this.filename = filename;
    this.separator = separator || '\n';
    this.encoding = encoding || 'utf8';
    this.chunkSize = chunkSize || 1024;
    this.pos = Math.max(this.size - this.chunkSize, 0);
    this.pointer = this.pos;
    this.buffer = null;
  }

  LineReader.prototype.searchBuffer = function () {
    if (this.buffer === null) {
      return false;
    }
    var separatorPos = this.buffer.lastIndexOf(this.separator);
    if (this.pos === 0 && separatorPos === -1) {
      var lastLine = this.buffer;
      this.buffer = '';
      return lastLine;
    }
    if (separatorPos === -1) {
      this.pointer = this.pos - this.chunkSize;
      if (this.pointer < 0) {
        this.pointer = 0;
      }
      this.pos = this.pointer;
      return false;
    } else {
      var line = this.buffer.substr(separatorPos + this.separator.length, this.buffer.length);
      this.buffer = this.buffer.substr(0, separatorPos);
      return line;
    }
  };

  LineReader.prototype.readLine = function (cb) {
    if (i > 20) {
      return;
    }
    i++;
    var _this = this;
    var chunkSize = 0;
    var line = _this.searchBuffer();
    if (line !== false) {
      cb(line, _this.buffer === '');
    } else {
      var stream = fs.createReadStream(this.filename, {
        start: this.pointer,
        end: this.pointer + this.chunkSize,
        encoding: this.encoding
      });

      stream.on('error', function (err) {
        throw err;
      });
      stream.on('end', function () {
        if(_this.buffer === null){
          cb(null, true);
        } else {
          _this.readLine(cb);
        }
      });
      stream.on('data', function (data) {
        if (_this.buffer === null) {
          _this.buffer = '';
        }
        _this.buffer += data;
        chunkSize += data.length;
      });
    }
  };


  function eachLine(filename, cb, separator, encoding, chunkSize) {
    var finalFn, asyncCb = cb.length == 3;
    var reader = new LineReader(filename, separator, encoding, chunkSize);
    readLine();
    function readLine(continueReading) {
      if (continueReading === false) {
        if (finalFn) {
          finalFn();
        }
        return;
      }
      reader.readLine(function (line, last) {
        if (line !== null && cb(line, last, last ? noop : readLine) !== false) {
          if (!last) {
            if (!asyncCb) {
              readLine();
            }
          }
        } else {
          last = true;
        }

        if (last && finalFn) {
          finalFn();
        }
      });
    }

    return {
      then: function (cb) {
        finalFn = cb;
      }
    };
  }

  module.exports.eachLine = eachLine;
}());
