'use strict';
const fs = require('hexo-fs');
function lazyProcess(htmlContent) {
  let loadingImage = this.config.lazyload.loadingImg || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  let className = this.config.lazyload.className || 'lazy';
  return htmlContent.replace(/<img(\s*?)src="(.*?)"(.*?)>/gi, (str, p1, p2, p3) => {
    if (/data-src/gi.test(str)) {
      return str;
    }
    if (/class="(.*?)"/gi.test(str)) {
      str = str.replace(/class="(.*?)"/gi, (classStr, p1) => {
        return classStr.replace(p1, `${p1} ${className}`);
      })
      return str.replace(p3, `${p3} srcset="${loadingImage}" data-srcset="${p2}"`);
    }
    return str.replace(p3, `${p3} class="${className}" srcset="${loadingImage}" data-srcset="${p2}"`);
  });
}

module.exports.processPost = function (data) {
  data.content = lazyProcess.call(this, data.content);
  return data;
};

module.exports.processSite = function (htmlContent) {
  return lazyProcess.call(this, htmlContent);
};