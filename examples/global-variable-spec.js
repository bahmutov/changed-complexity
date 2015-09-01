require('lazy-ass');
var escomplexJs = require('escomplex-js').analyse;
var read = require('fs').readFileSync;
var before = read('./global-variable.js');
var after = read('./global-variable-after.js');

describe('global-variable', function () {
  it('is simpler after moving global variable to local scope', function () {
    var complexityBefore = escomplexJs(before);
    var complexityAfter = escomplexJs(after);
    la(complexityBefore);
    la(complexityAfter);
  });
});
