let isfetched = false;
let datas;
let isXml = false;
let path = window.search_path;
const top_n_per_article = 10;

if (/json$/i.test(path)) {
  isXml = false;
}

const searchbox = document.querySelector('.searchbox');
const input = document.querySelector('.searchbox-input');
const resultContent = document.querySelector('.searchbox-body');

const unescapeHtml = html => {
  return String(html)
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, '\'')
    .replace(/&#x3A;/g, ':')
    // Replace all the other &#x; chars
    .replace(/&#(\d+);/g, (m, p) => {
      return String.fromCharCode(p);
    })
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
};

const getIndexByWord = (word, text, caseSensitive) => {
  let wordLen = word.length;
  if (wordLen === 0) return [];
  let startPosition = 0;
  let position = [];
  let index = [];
  if (!caseSensitive) {
    text = text.toLowerCase();
    word = word.toLowerCase();
  }
  while ((position = text.indexOf(word, startPosition)) > -1) {
    index.push({
      position: position,
      word: word
    });
    startPosition = position + wordLen;
  }
  return index;
};

const mergeIntoSlice = (start, end, index, searchText) => {
  let item = index[index.length - 1];
  let position = item.position;
  let word = item.word;
  let hits = [];
  let searchTextCountInSlice = 0;
  while (position + word.length <= end && index.length !== 0) {
    if (word === searchText) {
      searchTextCountInSlice++;
    }
    hits.push({
      position: position,
      length: word.length
    });
    let wordEnd = position + word.length;

    // Move to next position of hit
    index.pop();
    while (index.length !== 0) {
      item = index[index.length - 1];
      position = item.position;
      word = item.word;
      if (wordEnd > position) {
        index.pop();
      } else {
        break;
      }
    }
  }
  return {
    hits: hits,
    start: start,
    end: end,
    searchTextCount: searchTextCountInSlice
  };
};

const highlightKeyword = (text, slice) => {
  let result = '';
  let prevEnd = slice.start;
  slice.hits.forEach(hit => {
    result += text.substring(prevEnd, hit.position);
    let end = hit.position + hit.length;
    result += `<em>${text.substring(hit.position, end)}</em>`;
    prevEnd = end;
  });
  result += text.substring(prevEnd, slice.end);
  return result;
};

const inputEventFunction = () => {
  let searchText = input.value.trim().toLowerCase();
  let keywords = searchText.split(/[-\s]+/);
  if (keywords.length > 1) {
    keywords.push(searchText);
  }
  let resultItems = [];
  if (searchText.length > 0) {
    // Perform local searching
    console.log(datas);
    datas.forEach(data => {
      // Only match articles with not empty titles
      if (!data.title) return;
      let searchTextCount = 0;
      let title = data.title.trim();
      let titleInLowerCase = title.toLowerCase();
      let content = data.content ? data.content.trim().replace(/<[^>]+>/g, '') : '';
      if (true) {
        content = unescapeHtml(content);
      }
      let contentInLowerCase = content.toLowerCase();
      let articleUrl = decodeURIComponent(data.url).replace(/\/{2,}/g, '/');
      let indexOfTitle = [];
      let indexOfContent = [];
      keywords.forEach(keyword => {
        indexOfTitle = indexOfTitle.concat(getIndexByWord(keyword, titleInLowerCase, false));
        indexOfContent = indexOfContent.concat(getIndexByWord(keyword, contentInLowerCase, false));
      });

      // Show search results
      if (indexOfTitle.length > 0 || indexOfContent.length > 0) {
        let hitCount = indexOfTitle.length + indexOfContent.length;
        // Sort index by position of keyword
        [indexOfTitle, indexOfContent].forEach(index => {
          index.sort((itemLeft, itemRight) => {
            if (itemRight.position !== itemLeft.position) {
              return itemRight.position - itemLeft.position;
            }
            return itemLeft.word.length - itemRight.word.length;
          });
        });

        let slicesOfTitle = [];
        if (indexOfTitle.length !== 0) {
          let tmp = mergeIntoSlice(0, title.length, indexOfTitle, searchText);
          searchTextCount += tmp.searchTextCountInSlice;
          slicesOfTitle.push(tmp);
        }

        let slicesOfContent = [];
        while (indexOfContent.length !== 0) {
          let item = indexOfContent[indexOfContent.length - 1];
          let position = item.position;
          let word = item.word;
          // Cut out 100 characters
          let start = position - 20;
          let end = position + 80;
          if (start < 0) {
            start = 0;
          }
          if (end < position + word.length) {
            end = position + word.length;
          }
          if (end > content.length) {
            end = content.length;
          }
          let tmp = mergeIntoSlice(start, end, indexOfContent, searchText);
          searchTextCount += tmp.searchTextCountInSlice;
          slicesOfContent.push(tmp);
        }

        // Sort slices in content by search text's count and hits' count
        slicesOfContent.sort((sliceLeft, sliceRight) => {
          if (sliceLeft.searchTextCount !== sliceRight.searchTextCount) {
            return sliceRight.searchTextCount - sliceLeft.searchTextCount;
          } else if (sliceLeft.hits.length !== sliceRight.hits.length) {
            return sliceRight.hits.length - sliceLeft.hits.length;
          }
          return sliceLeft.start - sliceRight.start;
        });

        // Select top N slices in content
        let upperBound = parseInt(top_n_per_article, 10);
        if (upperBound >= 0) {
          slicesOfContent = slicesOfContent.slice(0, upperBound);
        }

        let resultItem = '';

        if (slicesOfTitle.length !== 0) {
          resultItem += `<a href="${articleUrl}" class="searchbox-result-item"><span class="searchbox-result-content"><span class="searchbox-result-title">${highlightKeyword(title, slicesOfTitle[0])}</span>`;
        } else {
          resultItem += `<a href="${articleUrl}" class="searchbox-result-item"><span class="searchbox-result-content"><span class="searchbox-result-title">${title}</span>`;
        }

        // console.log(slicesOfContent);
        resultItem += '<span class="searchbox-result-preview">';
        slicesOfContent.forEach(slice => {
          resultItem += `${highlightKeyword(content, slice)}... `;

        });
        resultItem += '</span>';

        resultItem += '</span></a>';
        resultItems.push({
          item: resultItem,
          searchTextCount: searchTextCount,
          hitCount: hitCount,
          id: resultItems.length
        });
      }
    });
  }
  if (keywords.length === 1 && keywords[0] === '') {
    // 未输入关键词
    resultContent.innerHTML = ''
    // resultContent.innerHTML = '<div class="no-result unselectable">请输入关键词...</div>';
  } else if (resultItems.length === 0) {
    // 无结果
    resultContent.innerHTML = '<div class="no-result unselectable">未查询到结果...</div>';
  } else {
    resultItems.sort((resultLeft, resultRight) => {
      if (resultLeft.searchTextCount !== resultRight.searchTextCount) {
        return resultRight.searchTextCount - resultLeft.searchTextCount;
      } else if (resultLeft.hitCount !== resultRight.hitCount) {
        return resultRight.hitCount - resultLeft.hitCount;
      }
      return resultRight.id - resultLeft.id;
    });
    // let searchResultList = '<ul class="search-result-list">';
    let searchResultList = '';
    resultItems.forEach(result => {
      searchResultList += result.item;
    });
    // searchResultList += '</ul>';
    resultContent.innerHTML = searchResultList;
    window.pjax && window.pjax.refresh(resultContent);
  }
};

// 获取搜索数据文件
const fetchData = callback => {
  fetch(path)
    .then(response => response.text())
    .then(res => {
      // Get the contents from search data
      isfetched = true;
      datas = isXml ? [...new DOMParser().parseFromString(res, 'text/xml').querySelectorAll('entry')].map(element => {
        return {
          title: element.querySelector('title').innerHTML,
          content: element.querySelector('content').innerHTML,
          url: element.querySelector('url').innerHTML
        };
      }) : JSON.parse(res);

      if (callback) {
        callback();
      }
    });
};

// 是否预加载搜索数据文件
if (false) {
  fetchData();
}

// 继续搜索
const proceedSearch = () => {
  document.body.style.overflow = 'hidden';
  document.querySelector('header.header').classList.add('unblur')
  // document.querySelector('.search-pop-overlay').style.display = 'block';
  // document.querySelector('.popup').style.display = 'block';
  input.focus();
};

// 第一次搜索
const searchFunc = () => {
  fetchData(proceedSearch);
};

// 是否实时显示搜索结果
if (true) {
  input.addEventListener('input', inputEventFunction);
} else {
  // document.querySelector('.search-icon').addEventListener('click', inputEventFunction);
  input.addEventListener('keypress', event => {
    if (event.keyCode === 13) {
      inputEventFunction();
    }
  });
}

// Handle and trigger popup window
document.querySelector('.search').addEventListener('click', () => {
  searchbox.style.display = 'flex';
  if (isfetched === false) {
    searchFunc();
  } else {
    proceedSearch();
  }
});

const onPopupClose = () => {
  document.body.style.overflow = '';
  document.querySelector('header.header').classList.remove('unblur')
  searchbox.style.display = 'none';
  // document.querySelector('.search-pop-overlay').style.display = 'none';
  // document.querySelector('.popup').style.display = 'none';
};

document.querySelector('.searchbox').addEventListener('click', event => {
  switch (event.target.className) {
    case 'searchbox':
    case 'searchbox-close':
      onPopupClose();
      break;
    default:
      break;
  }
}, false);

// document.querySelector('.searchbox-close').addEventListener('click', onPopupClose);
// document.querySelector('.searchbox').addEventListener('click', (event) => {
//   onPopupClose();
//   event.stopImmediatePropagation();
// }, true);
// document.querySelector('.popup-btn-close').addEventListener('click', onPopupClose);
// window.addEventListener('pjax:success', onPopupClose);
window.addEventListener('keyup', event => {
  if (event.which === 27) {
    onPopupClose();
  }
});
window.addEventListener('popstate', event => {
  console.log(event);
  onPopupClose();
}, false);
