var path = require('path'),
fs = require('fs-extra'),
path = require('path'),
gulp = require('gulp'),
debug = require('gulp-debug'),
replace = require('gulp-replace'),
Sugar = require('sugar'),
initConf = require('./conf/'),
typeIs = require('./utils/type-is'),
collectI18nFromDir = require('./collect-i18n-from-dir'),
i18nContent2Locales = require('./i18n-content2locales'),
readLocalesFromFile = require('./read-locales-from-file');

/**
 * @param  {Object} customConf
 */
 module.exports = function i18n(customConf) {
  var conf = initConf(customConf),
  locales = conf.locales;

  if (!locales) {
    var i18nContent = collectI18nFromDir(conf.srcDir, conf.regI18nContent, conf.defaultLang);
    if (conf.saveI18nContentTo) fs.outputJson(conf.saveI18nContentTo, i18nContent);
    
    locales = i18nContent2Locales(i18nContent, conf.sourceLang);
  } else {
    if (typeIs.string(locales)) locales = readLocalesFromFile(locales);
    console.log('[I18N notice] you are using a backup locales\n');
  }

  if (conf.saveLocalesTo) fs.outputJson(conf.saveLocalesTo, locales);

  var langs = Sugar.Array.subtract(Sugar.Object.keys(locales), conf.excludeLangs);

  langs.forEach(function (lang) {
    var targetDir = path.join(conf.distDir, lang),
    stat = fs.lstatSync(conf.srcDir);
    if(stat.isDirectory()){
      // fs.copySync(conf.buildDir, targetDir);
      return translate(conf.glob,conf,targetDir,locales,lang);
    }else{
      var fileName = conf.srcDir.split(conf.appDir)[1];
      var langFile = path.join(conf.buildDir,fileName);
      // fs.writeFileSync(langFile, fs.readFileSync(conf.srcDir));
      return translate(langFile,conf,targetDir,locales,lang);
    }
    
  });
};


var translate = function(targets,conf,targetDir,locales,lang){
  return gulp.src(targets, { base: conf.buildDir })
  .pipe(debug({ title: '[I18N translating ' + lang + '] ' }))
  .pipe(replace(conf.regDelimeter, function (match, target) {
        
        // if (lang === conf.sourceLang) return target;
        // 默认语言也先判断下配置表中是否存在特殊翻译
        var translation = locales[lang][target];   
        return typeIs.undefined(translation) ? target : translation;
      }))
  .pipe(gulp.dest(targetDir))
  .on('end', function () {
    console.log('[I18N finished', lang + ']');
  });
}