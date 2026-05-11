// pantheon.js

function makeImg(src, imgClass, placeholderClass, icon) {
  if (src) {
    return '<img src="' + src + '" class="' + imgClass + '" alt="" loading="lazy" onerror="this.style.display=\'none\';this.nextSibling.style.display=\'flex\'">' +
           '<div class="' + placeholderClass + '" style="display:none">' + icon + '</div>';
  }
  return '<div class="' + placeholderClass + '">' + icon + '</div>';
}

function renderGods(gods) {
  var grid = document.getElementById('godsGrid');
  if (!grid) return;
  var html = '';
  for (var i = 0; i < gods.length; i++) {
    var god = gods[i];
    html += '<div class="god-card" data-align="' + god.alignment + '">' +
      '<div class="god-card__header">' +
      makeImg(god.image, 'god-card__img', 'god-card__img-placeholder', '⚡') +
      '<div>' +
      '<div class="god-card__name">' + god.name + '</div>' +
      '<div class="god-card__domain">' + god.domain + '</div>' +
      '</div></div>' +
      '<div class="god-card__desc">' + god.description +
      '<div class="god-card__alignment">' + god.alignment + '</div>' +
      '</div></div>';
  }
  grid.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', function() {
  fetch('data/gods.json')
    .then(function(r) { return r.json(); })
    .then(function(gods) {
      renderGods(gods);
      var filters = document.getElementById('godsFilters');
      if (filters) {
        filters.addEventListener('click', function(e) {
          var btn = e.target.closest('.filter-btn');
          if (!btn) return;
          filters.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
          btn.classList.add('active');
          var align = btn.dataset.align;
          if (align === 'all') {
            renderGods(gods);
          } else {
            renderGods(gods.filter(function(g) { return g.alignment.indexOf(align) !== -1; }));
          }
        });
      }
    })
    .catch(function(e) { console.error('gods.json error', e); });
});
