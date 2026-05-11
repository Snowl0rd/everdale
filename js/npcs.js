// npcs.js — загрузка и отображение НПС из npcs.json

const tagLabels = {
  'опасный':        { label: 'Опасный',    cls: 'tag--danger' },
  'дружелюбный':    { label: 'Дружелюб.',  cls: 'tag--friendly' },
  'подозрительный': { label: 'Подозр.',    cls: 'tag--suspicious' },
};

function tagClass(tag) {
  return tagLabels[tag]?.cls || '';
}

function tagLabel(tag) {
  return tagLabels[tag]?.label || tag;
}

function imgOrPlaceholder(src, cls, placeholder = '👤') {
  if (src) {
    return `<img src="${src}" class="${cls}" alt="" onerror="this.parentNode.innerHTML='<div class=\\"${cls.replace('__img','__img-placeholder')}\\">${placeholder}</div>'" loading="lazy">`;
  }
  return `<div class="${cls.replace('__img','__img-placeholder')}">${placeholder}</div>`;
}

// ----- Отрисовка карточек -----
function renderCards(npcs) {
  const grid = document.getElementById('npcGrid');
  if (!grid) return;

  grid.innerHTML = npcs.map(npc => `
    <div class="npc-card" data-id="${npc.id}">
      ${imgOrPlaceholder(npc.image, 'npc-card__img')}
      <div class="npc-card__body">
        <div class="npc-card__name">${npc.name}</div>
        <div class="npc-card__race">${npc.race}</div>
        <div class="npc-card__role">${npc.role}</div>
        ${npc.tags?.length ? `
          <div class="tags">
            ${npc.tags.map(t => `<span class="tag ${tagClass(t)}">${tagLabel(t)}</span>`).join('')}
          </div>` : ''}
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.npc-card').forEach(card => {
    card.addEventListener('click', () => {
      const npc = npcs.find(n => n.id === card.dataset.id);
      openModal(npc);
    });
  });
}

// ----- Фильтры -----
function buildFilters(npcs) {
  const container = document.getElementById('npcFilters');
  if (!container) return;

  const allTags = [...new Set(npcs.flatMap(n => n.tags || []))];
  allTags.forEach(tag => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.dataset.tag = tag;
    btn.textContent = tagLabel(tag);
    container.appendChild(btn);
  });

  container.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;

    container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const tag = btn.dataset.tag;
    const search = document.getElementById('npcSearch')?.value.toLowerCase() || '';
    filterAndRender(npcs, tag, search);
  });
}

function filterAndRender(npcs, tag, search) {
  let result = npcs;
  if (tag && tag !== 'all') result = result.filter(n => n.tags?.includes(tag));
  if (search) result = result.filter(n =>
    n.name.toLowerCase().includes(search) ||
    n.role.toLowerCase().includes(search) ||
    n.race.toLowerCase().includes(search)
  );
  renderCards(result);
}

// ----- Модал -----
function openModal(npc) {
  const overlay = document.getElementById('npcModal');

  document.getElementById('modalImg').innerHTML =
    imgOrPlaceholder(npc.image, 'modal__img');
  document.getElementById('modalName').textContent = npc.name;
  document.getElementById('modalRace').textContent = npc.race;
  document.getElementById('modalRole').textContent = npc.role;
  document.getElementById('modalDesc').textContent = npc.description;
  document.getElementById('modalTags').innerHTML = (npc.tags || [])
    .map(t => `<span class="tag ${tagClass(t)}">${tagLabel(t)}</span>`).join('');

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('npcModal').classList.remove('open');
  document.body.style.overflow = '';
}

// ----- Инициализация -----
document.addEventListener('DOMContentLoaded', async () => {
  let npcs = [];

  try {
    const res = await fetch('data/npcs.json');
    npcs = await res.json();
  } catch (e) {
    console.error('Не удалось загрузить npcs.json', e);
    document.getElementById('npcGrid').innerHTML =
      '<p style="color:var(--text-dim);padding:2rem;">Ошибка загрузки данных.</p>';
    return;
  }

  renderCards(npcs);
  buildFilters(npcs);

  // Поиск
  const searchInput = document.getElementById('npcSearch');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const activeTag = document.querySelector('.filter-btn.active')?.dataset.tag || 'all';
      filterAndRender(npcs, activeTag, searchInput.value.toLowerCase());
    });
  }

  // Закрытие модала
  document.getElementById('modalClose')?.addEventListener('click', closeModal);
  document.getElementById('npcModal')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
});
