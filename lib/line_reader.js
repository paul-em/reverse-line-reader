(function () {
  "use strict";
  var fs = require('fs');

  function LineReader(filename, separator, encoding, chunkSize) {
    this.size = fs.statSync(filename).size;
    this.filename = filename;
    this.separator = separator || '\n';
    this.encoding = encoding || 'utf8';
    this.chunkSize = chunkSize || 1024;
    this.pos = Math.max(this.size - this.chunkSize, 0);
    this.pointer = this.pos;
    this.buffer = '';

  }

  LineReader.prototype.searchBuffer = function () {
    var separatorPos = this.buffer.lastIndexOf(this.separator);
    if (this.pos === 0 || this.pos) {
      return this.buffer;
    }
    if (separatorPos === -1) {
      this.pointer = this.pos - this.chunkSize;
      if (this.pointer < 0) {
        this.pointer = 0;
      }
      this.pos = this.pointer;
      return false;
    } else {
      var line = this.buffer.substr(separatorPos + this.separator.length);
      this.buffer = this.buffer.substr(0, separatorPos);
      return line;
    }
  };

  LineReader.prototype.readLine = function (cb) {
    var _this = this;
    var chunkSize = 0;
    var line = _this.searchBuffer();
    if (line) {
      cb(line, _this.buffer === '');
    } else {
      console.log('create stream', {
        start: this.pointer,
        end: this.pointer + this.chunkSize,
        encoding: this.encoding
      });
      var stream = fs.createReadStream(this.filename, {
        start: this.pointer,
        end: this.pointer + this.chunkSize,
        encoding: this.encoding
      });

      stream.on('error', function (err) {
        throw err;
      });
      stream.on('end', function () {
        if (chunkSize !== _this.chunkSize) {
          cb(_this.buffer, true);
        } else {
          _this.readLine(cb);
        }
      });
      stream.on('data', function (data) {
        _this.buffer += data;
        chunkSize += data.length;
      });
    }
  };


  function eachLine(filename, cb, separator, encoding, chunkSize) {
    var finalFn;
    var reader = new LineReader(filename, separator, encoding, chunkSize);
    readLine();
    function readLine() {
      reader.readLine(function (line, last) {
        if (cb(line, last) !== false && !last) {
          readLine();
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
