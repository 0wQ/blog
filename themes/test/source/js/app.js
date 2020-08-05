if (window.pageType == 'post') {
  let days = (new Date().getTime() - Date.parse((document.getElementById('last_edited_date') || document.getElementById('date')).getAttribute('datetime'))) / (1000 * 60 * 60 * 24);
  console.log(days);
  if (days >= 365) {
    document.querySelector('.post-content').insertAdjacentHTML('afterbegin',
      '<div class="admonition admonition-warning"><p style="margin-bottom: 0;">🌶 <strong>过期警告：</strong> 本页面距今已有 ' + parseInt(days) + ' 天未更新，年久失修，内容可能有所偏颇，还请仔细甄别！</p></div>');
  }
}
document.querySelectorAll('time#date, time#last_edited_date').forEach(e => {
  let t = formatDate(e.getAttribute('datetime'));
  if (t !== false) {
    e.textContent = t;
  }
})
function formatDate(date) {
  const diffValue = new Date().getTime() - new Date(date);
  if (diffValue < 0) {
    return false;
  }
  let s = diffValue / 1000;
  let m = diffValue / (1000 * 60);
  let h = diffValue / (1000 * 60 * 60);
  let d = diffValue / (1000 * 60 * 60 * 24);
  let w = diffValue / (1000 * 60 * 60 * 24 * 7);
  let result;
  if (w >= 1) {
    result = false;
  } else if (d >= 1) {
    result = parseInt(d) + (d == 1 ? ' day ago' : ' days ago');
  } else if (h >= 1) {
    result = parseInt(h) + (h == 1 ? ' hour ago' : ' hours ago');
  } else if (m >= 1) {
    result = parseInt(m) + (m == 1 ? ' minute ago' : ' minutes ago');
  } else {
    result = parseInt(s) + (s <= 1 ? ' second ago' : ' seconds ago');
  }
  return result;
}


if (document.body.getAttribute('data-theme') == 'dark') {
  document.getElementById('moon').classList.toggle('is-hidden');
  document.getElementById('sun').classList.toggle('is-hidden');
}

let btn = document.getElementById('toggle-theme');
btn.addEventListener('click', function () {
  var newTheme = (document.body.getAttribute('data-theme') == 'light') ? 'dark' : 'light';
  document.body.setAttribute('data-theme', newTheme);
  document.getElementById('moon').classList.toggle('is-hidden');
  document.getElementById('sun').classList.toggle('is-hidden');
  try {
    localStorage.setItem('theme', newTheme)
  } catch (err) { }
});

window.addEventListener('error', e => {
  let target = e.target,
    tagName = target.tagName,
    times = Number(target.dataset.times) || 0,
    allTimes = 30;
  if (tagName.toUpperCase() === 'IMG') {
    if (times >= allTimes) {
      target.srcset = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      target.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    } else {
      target.dataset.times = times + 1;
      target.srcset = 'https://oktools.net/ph/32x32?t=Loading error';
      target.src = 'https://oktools.net/ph/32x32?t=Loading+Error';
    }
  }
}, true)

window.post_views_api = 'https://ga-hit-count-serverless-git-master.mizore.vercel.app/api/ga'

document.querySelectorAll('#views').forEach(async e => {
  const path = e.getAttribute('data-path')
  const json = await fetch(`${window.post_views_api}?page=${path}`).then(res => res.json())
  const hit = json[0].hit
  if (hit !== undefined) {
    e.innerHTML = `${hit}`
  }
  console.log(path, json)
})
