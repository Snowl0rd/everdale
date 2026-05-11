// npcs.js

const tagLabels = {
  'опасный':        { label: 'Опасный',    cls: 'tag--danger' },
  'дружелюбный':    { label: 'Дружелюб.',  cls: 'tag--friendly' },
  'подозрительный': { label: 'Подозр.',    cls: 'tag--suspicious' },
};

function tagCls(tag) { return tagLabels[tag] ? tagLabels[tag].cls : ''; }
function tagLbl(tag) { return tagLabels[tag] ? tagLabels[tag].label : tag; }

function makeImg(src, imgClass, placeholderClass, icon) {
  if (src) {
    return '<img src="' + src + '" class="' + imgClass + '" alt="" loading="lazy" onerror="this.style.display=\'none\';this.nextSibling.style.display=\'flex\'">' +
           '<div class="' + placeholderClass + '" style="display:none">' + icon + '</div>';
  }
  return '<div class="' + placeholderClass + '">' + icon + '</div>';
}

function renderCards(npcs) {
  var grid = document.getElementById('npcGrid');
  if (!grid) return;
  var html = '';
  for (var i = 0; i < npcs.length; i++) {
    var npc = npcs[i];
    var tags = '';
    if (npc.tags && npc.tags.length) {
      for (var t = 0; t < npc.tags.length; t++) {
        tags += '<span class="tag ' + tagCls(npc.tags[t]) + '">' + tagLbl(npc.tags[t]) + '</span>';
      }
      tags = '<div class="tags">' + tags + '</div>';
    }
    html += '<div class="npc-card" data-id="' + npc.id + '">' +
      makeImg(npc.image, 'npc-card__img', 'npc-card__img-placeholder', '👤') +
      '<div class="npc-card__body">' +
      '<div class="npc-card__name">' + npc.name + '</div>' +
      '<div class="npc-card__race">' + npc.race + '</div>' +
      '<div class="npc-card__role">' + npc.role + '</div>' +
      tags +
      '</div></div>';
  }
  grid.innerHTML = html;
  var cards = grid.querySelectorAll('.npc-card');
  for (var c = 0; c < cards.length; c++) {
    cards[c].addEventListener('click', (function(list) {
      return function() {
        var id = this.dataset.id;
        for (var n = 0; n < list.length; n++) {
          if (list[n].id === id) { openModal(list[n]); break; }
        }
      };
    })(npcs));
  }
}

function buildFilters(npcs) {
  var container = document.getElementById('npcFilters');
  if (!container) return;
  var allTags = [];
  for (var i = 0; i < npcs.length; i++) {
    var tags = npcs[i].tags || [];
    for (var t = 0; t < tags.length; t++) {
      if (allTags.indexOf(tags[t]) === -1) allTags.push(tags[t]);
    }
  }
  for (var a = 0; a < allTags.length; a++) {
    var btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.dataset.tag = allTags[a];
    btn.textContent = tagLbl(allTags[a]);
    container.appendChild(btn);
  }
  container.addEventListener('click', function(e) {
    var btn = e.target.closest('.filter-btn');
    if (!btn) return;
    container.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
    btn.classList.add('active');
    var search = document.getElementById('npcSearch') ? document.getElementById('npcSearch').value.toLowerCase() : '';
    filterAndRender(npcs, btn.dataset.tag, search);
  });
}

function filterAndRender(npcs, tag, search) {
  var result = npcs;
  if (tag && tag !== 'all') result = result.filter(function(n) { return n.tags && n.tags.indexOf(tag) !== -1; });
  if (search) result = result.filter(function(n) {
    return n.name.toLowerCase().indexOf(search) !== -1 ||
           n.role.toLowerCase().indexOf(search) !== -1 ||
           n.race.toLowerCase().indexOf(search) !== -1;
  });
  renderCards(result);
}

function openModal(npc) {
  var overlay = document.getElementById('npcModal');
  var imgHtml = makeImg(npc.image, 'modal__img', 'modal__img-placeholder', '👤');
  document.getElementById('modalImg').innerHTML = imgHtml;
  document.getElementById('modalName').textContent = npc.name;
  document.getElementById('modalRace').textContent = npc.race;
  document.getElementById('modalRole').textContent = npc.role;
  document.getElementById('modalDesc').textContent = npc.description;
  var tagsHtml = '';
  if (npc.tags) {
    for (var t = 0; t < npc.tags.length; t++) {
      tagsHtml += '<span class="tag ' + tagCls(npc.tags[t]) + '">' + tagLbl(npc.tags[t]) + '</span>';
    }
  }
  document.getElementById('modalTags').innerHTML = tagsHtml;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('npcModal').classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', function() {
  fetch('data/npcs.json')
    .then(function(r) { return r.json(); })
    .then(function(npcs) {
      renderCards(npcs);
      buildFilters(npcs);
      var searchInput = document.getElementById('npcSearch');
      if (searchInput) {
        searchInput.addEventListener('input', function() {
          var activeTag = document.querySelector('.filter-btn.active');
          filterAndRender(npcs, activeTag ? activeTag.dataset.tag : 'all', this.value.toLowerCase());
        });
      }
      document.getElementById('modalClose').addEventListener('click', closeModal);
      document.getElementById('npcModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal();
      });
      document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeModal(); });
    })
    .catch(function(e) { console.error('npcs.json error', e); });
});
