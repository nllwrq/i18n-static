var recursiveReadSync = require('recursive-readdir-sync'),
  mergeObj = require('./utils/merge-obj'),
  fs = require("fs");

/**
 * @param  {String} baseDir
 * @param  {Regexp} regI18nContent
 * @param  {String} defaultLang
 * @return {Object}
 */
module.exports = function (baseDir, regI18nContent, defaultLang) {
  var extractI18nContent = require('./extract-i18n-content')(regI18nContent, defaultLang),
  stat = fs.lstatSync(baseDir),
  files = [];
  if(stat.isDirectory()){
    files = recursiveReadSync(baseDir);
  }else if(stat.isFile()){
    files.push(baseDir)
  }else{
    return ;
  }
  
    i18nContent = {};

  files.forEach(function (pathToFile, idx) {
    console.log(
      '[I18N extracting (' + (idx + 1) + '/' + files.length + ')]',
      pathToFile
    );
    mergeObj(i18nContent, extractI18nContent(pathToFile));
  });

  return i18nContent;
};
