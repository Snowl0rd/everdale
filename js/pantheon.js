// pantheon.js — загрузка и отображение богов из gods.json

function imgOrPlaceholder(src, cls, placeholder = '⚡') {
  if (src) {
    return `<img src="${src}" class="${cls}" alt="" onerror="this.parentNode.innerHTML='<div class=\\"${cls.replace('__img','__img-placeholder')}\\">${placeholder}</div>'" loading="lazy">`;
  }
  return `<div class="${cls.replace('__img','__img-placeholder')}">${placeholder}</div>`;
}

function renderGods(gods) {
  const grid = document.getElementById('godsGrid');
  if (!grid) return;

  grid.innerHTML = gods.map(god => `
    <div class="god-card" data-align="${god.alignment}">
      <div class="god-card__header">
        ${imgOrPlaceholder(god.image, 'god-card__img')}
        <div>
          <div class="god-card__name">${god.name}</div>
          <div class="god-card__domain">${god.domain}</div>
        </div>
      </div>
      <div class="god-card__desc">
        ${god.description}
        <div class="god-card__alignment">${god.alignment}</div>
      </div>
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', async () => {
  let gods = [];

  try {
    const res = await fetch('data/gods.json');
    gods = await res.json();
  } catch (e) {
    console.error('Не удалось загрузить gods.json', e);
    return;
  }

  renderGods(gods);

  // Фильтры
  const filters = document.getElementById('godsFilters');
  if (filters) {
    filters.addEventListener('click', e => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;

      filters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const align = btn.dataset.align;
      if (align === 'all') {
        renderGods(gods);
      } else {
        renderGods(gods.filter(g => g.alignment.includes(align)));
      }
    });
  }
});
