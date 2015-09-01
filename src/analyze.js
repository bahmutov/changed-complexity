require('lazy-ass');
var check = require('check-more-types');
var log = require('debug')('analyze');
var R = require('ramda');
var escomplexJs = require('escomplex-js').analyse;
la(check.fn(escomplexJs), 'expected a complexity function', escomplexJs);

// TODO move to check-more-types
check.mixin(function char(x) {
  return typeof x === 'string' &&
    x.length === 1;
});

function isJavaScript(name) {
  return /\.js$/.test(name);
}

// TODO collect results in a single returned object

function beforeAndAfterComplexity(changedFile) {
  la(check.object(changedFile));
  la(check.unemptyString(changedFile.name), 'missing name', changedFile);
  la(check.string(changedFile.before), 'missing before source', changedFile);
  la(check.string(changedFile.after), 'missing after source', changedFile);
  log('changed file', changedFile.name);
  if (!isJavaScript(changedFile.name)) {
    log('cannot analyze non javascript file', changedFile.name);
    return;
  }
  var complexity = {
    name: changedFile.name
  };
  complexity.before = escomplexJs(changedFile.before);
  complexity.after = escomplexJs(changedFile.after);
  return complexity;
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
    return fn(list);
  } else {
    log('no analysis for change type', change);
  }
}

function addChangeResult(individualFileResults, list, change) {
  la(check.object(individualFileResults));
  la(check.char(change), 'expected change letter', change);

  if (check.not.defined(list)) {
    return;
  }
  la(check.array(list), 'expected list of changes', list);
  if (check.empty(list)) {
    return;
  }

  list.filter(check.defined).forEach(function (fileResult) {
    la(check.object(fileResult), 'expected object with result', fileResult);
    la(check.unemptyString(fileResult.name), 'missing name in', fileResult);

    fileResult.change = change;
    individualFileResults[fileResult.name] = fileResult;
  });

  return individualFileResults;
}

function reportChanges(log, changes) {
  la(check.fn(log), 'missing log function', log);
  la(check.object(changes), 'missing changes', changes);
  log(changes);
}

function locLogger(printer, fileChanges) {
  la(check.object(fileChanges), 'missing file changes', fileChanges);

  Object.keys(fileChanges).forEach(function (name) {
    var fileChange = fileChanges[name];
    la(check.char(fileChange.change), 'missing change in', fileChange);

    if (fileChange.change === 'M') {
      var before = fileChange.before.aggregate;
      var locBefore = before.sloc.logical;
      var after = fileChange.after.aggregate;
      var locAfter = after.sloc.logical;
      var locDiff = locAfter - locBefore;
      var locChange = locAfter < locBefore ? '-' + locDiff : '+' + locDiff;
      printer('%s %s LOC', fileChange.name, locChange);
    } else if (fileChange.change === 'A') {
      var after = fileChange.after.aggregate;
      var locAfter = after.sloc.logical;
      var locChange = '+' + locAfter;
      printer('%s %s LOC', fileChange.name, locChange);
    }
  });
}

function analyzeChangedFiles(changes) {
  la(check.object(changes));
  log('analyzing changed files');

  var fileResults = {};

  R.keys(changes).forEach(function (letter) {
    var changeResult = analyzeFiles(changes[letter], letter);
    addChangeResult(fileResults, changeResult, letter);
  });

  // reportChanges(console.log.bind(console), fileResults);
  var consoleLog = console.log.bind(console);
  var locLog = locLogger.bind(null, consoleLog);
  reportChanges(locLog, fileResults);
}


module.exports = analyzeChangedFiles;
