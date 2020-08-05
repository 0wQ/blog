hexo.extend.helper.register('_format_list', function (str) {
  return str.replace(/<a.*?href="(.*?)">(.*?)<\/a><span\s.*?>(.*?)<\/span>/g, "<a href=\"$1\"><span>$2</span><span class=\"number\">$3</span></a>");
});

hexo.extend.helper.register('_get_domain', function (url) {
  let domain = url.split('/');
  return domain = domain[2] ? domain[2] : '';
});

// https://github.com/SukkaW/hexo-theme-suka/blob/1d457ac9fbad421d2e6b9853ae1cb3dfc5cadf05/includes/helpers/page.js#L12-L31
hexo.extend.helper.register('_page_title', function (page = null) {
  page = (page === null) ? this.page : page;

  let title = page.title;

  if (this.is_archive()) {
    title = this.__('Archive');
    if (this.is_month()) {
      title += `: ${page.year}/${page.month}`;
    } else if (this.is_year()) {
      title += `: ${page.year}`;
    }
  } else if (this.is_category()) {
    title = `${this.__('Category')}: ${page.category}`;
  } else if (this.is_tag()) {
    title = `${this.__('Tag')}: ${page.tag}`;
  }

  return [title, hexo.config.title].filter((str) => typeof (str) !== 'undefined' && str.trim() !== '').join(' - ');
});