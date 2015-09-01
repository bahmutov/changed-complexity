require('lazy-ass');
var describeIt = require('describe-it');
var filename = __dirname + '/analyze.js';

describeIt(filename, 'isJavaScript(name)', function (fn) {
  var isJavaScript;
  beforeEach(function () {
    isJavaScript = fn();
  });

  it('works for js files', function () {
    la(isJavaScript('foo.js'));
    la(isJavaScript('foo-bar.js'));
    la(isJavaScript('some/folder/path/foo.js'));
  });

  it('does not work for other files', function () {
    la(!isJavaScript('foo.json'));
    la(!isJavaScript('foo-bar'));
    la(!isJavaScript('some/folder.js/path/foo'));
  });
});
