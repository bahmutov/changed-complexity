require('lazy-ass');
var check = require('check-more-types');
var log = require('debug')('analyze');
var R = require('ramda');

check.mixin(function char(x) {
  return typeof x === 'string' &&
    x.length === 1;
});

// TODO collect results in a single returned object

function beforeAndAfterComplexity(changedFile) {
  la(check.object(changedFile));
  la(check.unemptyString(changedFile.name), 'missing name', changedFile);
  la(check.string(changedFile.before), 'missing before source', changedFile);
  la(check.string(changedFile.after), 'missing after source', changedFile);
  log('changed file', changedFile);
}

function analyzeModifiedFiles(list) {
  la(check.array(list), 'missing list of changed files', list);
  var changedComplexity = list.map(beforeAndAfterComplexity);
  return changedComplexity;
}

function analysisForChange(change) {
  la(check.char(change), 'expected change letter', change);
  var fns = {
    M: analyzeModifiedFiles
  };
  return fns[change];
}

function analyzeFiles(list, change) {
  la(check.array(list), 'expected list of files', list,
    'for change', change);
  la(check.char(change), 'expected single change letter', change);

  var fn = analysisForChange(change);
  if (fn) {
    log('analyzing change', change, 'for list with', list.length, 'files');
    fn(list);
  } else {
    log('no analysis for change type', change);
  }
}

function analyzeChangedFiles(changes) {
  la(check.object(changes));
  log('analyzing changed files');
  R.keys(changes).forEach(function (letter) {
    analyzeFiles(changes[letter], letter);
  });
}


module.exports = analyzeChangedFiles;
