require('lazy-ass');
var check = require('check-more-types');
var changedFiles = require('ggit').changedFiles;
var analyzeChangedFiles = require('./src/analyze');

var needContents = true;
changedFiles(needContents)
  .then(analyzeChangedFiles)
  .catch(console.error.bind(console))
  .done();
