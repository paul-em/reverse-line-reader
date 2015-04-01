var lineReader = require('../lib/line_reader'),
  assert = require('assert'),
  testFilePath = __dirname + '/data/normal_file.txt',
  separatorFilePath = __dirname + '/data/separator_file.txt',
  multiSeparatorFilePath = __dirname + '/data/multi_separator_file.txt',
  multibyteFilePath = __dirname + '/data/multibyte_file.txt',
  emptyFilePath = __dirname + '/data/empty_file.txt',
  oneLineFilePath = __dirname + '/data/one_line_file.txt',
  threeLineFilePath = __dirname + '/data/three_line_file.txt',
  testSeparatorFile = ['foo', 'bar\n', 'baz\n'],
  testFile = [
    'Jabberwocky',
    '',
    '’Twas brillig, and the slithy toves',
    'Did gyre and gimble in the wabe;',
    '',
    ''
  ];

describe("lineReader", function () {
  describe("eachLine", function () {
    it("should read lines using the default separator", function (done) {
      var i = testFile.length - 1;

      lineReader.eachLine(testFilePath, function (line, last) {
        assert.equal(testFile[i], line, 'Each line should be what we expect');
        if (i === 0) {
          assert.ok(last);
        } else {
          assert.ok(!last);
        }
        i -= 1;
      }).then(function () {
        assert.equal(-1, i);
        done();
      });
    });

    it("should read lines using the default separator and smaller buffer", function (done) {
      var i = testFile.length - 1;

      lineReader.eachLine(testFilePath, function (line, last) {
        assert.equal(testFile[i], line, 'Each line should be what we expect');
        if (i === 0) {
          assert.ok(last);
        } else {
          assert.ok(!last);
        }
        i -= 1;
      }, undefined, undefined, 10).then(function () {
        assert.equal(-1, i);
        done();
      });
    });

    it("should read lines using the default separator and even smaller buffer", function (done) {
      var i = testFile.length - 1;

      lineReader.eachLine(testFilePath, function (line, last) {
        assert.equal(testFile[i], line, 'Each line should be what we expect');
        if (i === 0) {
          assert.ok(last);
        } else {
          assert.ok(!last);
        }
        i -= 1;
      }, undefined, undefined, 6).then(function () {
        assert.equal(-1, i);
        done();
      });
    });

    it("should allow continuation of line reading via a callback", function (done) {
      var i = testFile.length - 1;

      lineReader.eachLine(testFilePath, function (line, last, cb) {
        assert.equal(testFile[i], line, 'Each line should be what we expect');
        if (i === 0) {
          assert.ok(last);
        } else {
          assert.ok(!last);
        }
        process.nextTick(cb);
        i -= 1;
      }).then(function () {
        assert.equal(-1, i);
        done();
      });
    });

    it("should separate files using given separator", function (done) {
      var i = testSeparatorFile.length - 1;
      lineReader.eachLine(separatorFilePath, function (line, last) {
        assert.equal(testSeparatorFile[i], line);
        if (i === 0) {
          assert.ok(last);
        } else {
          assert.ok(!last);
        }
        i -= 1;
      }, ';').then(function () {
        assert.equal(-1, i);
        done();
      });
    });

    it("should separate files using given separator with more than one character", function (done) {
      var i = testSeparatorFile.length - 1;
      lineReader.eachLine(multiSeparatorFilePath, function (line, last) {
        assert.equal(testSeparatorFile[i], line);
        if (i === 0) {
          assert.ok(last);
        } else {
          assert.ok(!last);
        }
        i -= 1;
      }, '||').then(function () {
        assert.equal(-1, i);
        done();
      });
    });

    it("should allow early termination of line reading", function (done) {
      var i = testFile.length - 1;
      lineReader.eachLine(testFilePath, function (line, last) {
        assert.equal(testFile[i], line, 'Each line should be what we expect');
        if (i === 2) {
          return false;
        }
        i -= 1;
      }).then(function () {
        assert.equal(2, i);
        done();
      });
    });

    it("should allow early termination of line reading via a callback", function (done) {
      var i = testFile.length - 1;
      lineReader.eachLine(testFilePath, function (line, last, cb) {
        assert.equal(testFile[i], line, 'Each line should be what we expect');

        i -= 1;
        if (i === 2) {
          cb(false);
        } else {
          cb();
        }
      }).then(function () {
        assert.equal(2, i);
        done();
      });
    });

    it("should not call callback on empty file", function (done) {
      lineReader.eachLine(emptyFilePath, function (line) {
        assert.ok(false, "Empty file should not cause any callbacks");
      }).then(function () {
        done()
      });
    });

    it("should work with a file containing only one line", function (done) {
      lineReader.eachLine(oneLineFilePath, function (line, last) {
        done();
        return false;
      });
    });

  });
});
