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
    html += '<div class="god-card" data-id="' + god.id + '" data-align="' + god.alignment + '" style="cursor:pointer;">' +
      '<div class="god-card__header">' +
      makeImg(god.image, 'god-card__img', 'god-card__img-placeholder', '⚡') +
      '<div>' +
      '<div class="god-card__name">' + god.name + '</div>' +
      '<div class="god-card__domain">' + god.domain + '</div>' +
      '</div></div>' +
      '<div class="god-card__desc">' +
      god.description.split('\n\n')[0] +
      '<div class="god-card__alignment">' + god.alignment + '</div>' +
      '</div></div>';
  }
  grid.innerHTML = html;

  var cards = grid.querySelectorAll('.god-card');
  for (var c = 0; c < cards.length; c++) {
    cards[c].addEventListener('click', (function(list) {
      return function() {
        var id = this.dataset.id;
        for (var n = 0; n < list.length; n++) {
          if (list[n].id === id) { openGodModal(list[n]); break; }
        }
      };
    })(gods));
  }
}

function openGodModal(god) {
  var overlay = document.getElementById('godModal');
  document.getElementById('godModalImg').innerHTML = makeImg(god.image, 'modal__img', 'modal__img-placeholder', '⚡');
  document.getElementById('godModalName').textContent = god.name;
  document.getElementById('godModalDomain').textContent = god.domain;
  document.getElementById('godModalAlignment').textContent = god.alignment;
  document.getElementById('godModalSymbol').textContent = 'Символ: ' + god.symbol;
  document.getElementById('godModalTitles').textContent = god.titles ? 'Титулы: ' + god.titles : '';
  // Форматируем описание — переводим \n\n в параграфы
  var parts = god.description.split('\n\n');
  var descHtml = '';
  for (var i = 0; i < parts.length; i++) {
    descHtml += '<p>' + parts[i] + '</p>';
  }
  document.getElementById('godModalDesc').innerHTML = descHtml;
  document.getElementById('godModalWorship').textContent = god.worship ? 'Почитается: ' + god.worship : '';
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeGodModal() {
  document.getElementById('godModal').classList.remove('open');
  document.body.style.overflow = '';
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

      document.getElementById('godModalClose').addEventListener('click', closeGodModal);
      document.getElementById('godModal').addEventListener('click', function(e) {
        if (e.target === this) closeGodModal();
      });
      document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeGodModal(); });
    })
    .catch(function(e) { console.error('gods.json error', e); });
});
