// world.js — карта Leaflet + карточки городов

function imgOrPlaceholder(src, cls, placeholder = '🏙️') {
  if (src) {
    return `<img src="${src}" class="${cls}" alt="" onerror="this.parentNode.innerHTML='<div class=\\"${cls.replace('__img','__img-placeholder')}\\">${placeholder}</div>'" loading="lazy">`;
  }
  return `<div class="${cls.replace('__img','__img-placeholder')}">${placeholder}</div>`;
}

// ----- Карта -----
function initMap(cities) {
  const mapEl = document.getElementById('everdale-map');
  if (!mapEl || typeof L === 'undefined') return;

  // Размер изображения карты (подставь реальный после загрузки)
  const imgW = 2000;
  const imgH = 1400;

  const bounds = [[0, 0], [imgH, imgW]];

  const map = L.map('everdale-map', {
    crs: L.CRS.Simple,
    minZoom: -2,
    maxZoom: 2,
    zoomSnap: 0.5,
  });

  // Проверяем есть ли карта
  const mapImg = 'images/map.jpg';
  L.imageOverlay(mapImg, bounds).addTo(map);
  map.fitBounds(bounds);

  // Стиль маркера
  const markerIcon = L.divIcon({
    className: '',
    html: `<div style="
      width: 12px; height: 12px;
      background: #c9a84c;
      border: 2px solid #0d0b08;
      box-shadow: 0 0 8px rgba(201,168,76,0.6);
      cursor: pointer;
    "></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    popupAnchor: [0, -10],
  });

  cities.forEach(city => {
    // mapX и mapY — проценты от размера карты
    const x = (city.mapX / 100) * imgW;
    const y = imgH - (city.mapY / 100) * imgH;

    const marker = L.marker([y, x], { icon: markerIcon }).addTo(map);

    const popupContent = `
      <div class="map-popup__name">${city.name}</div>
      <div class="map-popup__sub">${city.subtitle}</div>
      <div class="map-popup__desc">${city.description.substring(0, 120)}...</div>
      <a class="map-popup__link" href="#city-${city.id}">Подробнее ↓</a>
    `;

    marker.bindPopup(popupContent, {
      maxWidth: 260,
      className: 'everdale-popup',
    });

    marker.on('click', () => {
      // Скролл к карточке города при клике на маркер
      setTimeout(() => {
        const card = document.getElementById(`city-${city.id}`);
        if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    });
  });
}

// ----- Карточки городов -----
function renderCities(cities) {
  const grid = document.getElementById('citiesGrid');
  if (!grid) return;

  grid.innerHTML = cities.map(city => `
    <div class="city-card" id="city-${city.id}" data-id="${city.id}">
      ${imgOrPlaceholder(city.image, 'city-card__img')}
      <div class="city-card__body">
        <div class="city-card__name">${city.name}</div>
        <div class="city-card__subtitle">${city.subtitle}</div>
        <p class="city-card__desc">${city.description}</p>
        <div class="city-card__atmosphere">${city.atmosphere}</div>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.city-card').forEach(card => {
    card.addEventListener('click', () => {
      const city = cities.find(c => c.id === card.dataset.id);
      openCityModal(city);
    });
  });
}

// ----- Модал города -----
function openCityModal(city) {
  const overlay = document.getElementById('cityModal');

  document.getElementById('cityModalImg').innerHTML =
    imgOrPlaceholder(city.image, 'city-card__img', '🏙️');
  document.getElementById('cityModalName').textContent = city.name;
  document.getElementById('cityModalSubtitle').textContent = city.subtitle;
  document.getElementById('cityModalDesc').textContent = city.description;
  document.getElementById('cityModalDetails').textContent = city.details || '';

  const poiContainer = document.getElementById('cityModalPOI');
  if (city.pointsOfInterest?.length) {
    poiContainer.innerHTML = `
      <div style="margin-top:1.2rem;border-top:1px solid var(--border);padding-top:1rem;">
        <h4 style="margin-bottom:0.8rem;font-size:0.7rem;letter-spacing:0.15em;color:var(--gold-dim);">// ТОЧКИ ИНТЕРЕСА</h4>
        ${city.pointsOfInterest.map(poi => `
          <div style="margin-bottom:0.8rem;">
            <div style="font-family:'Cinzel',serif;font-size:0.85rem;color:var(--gold2);margin-bottom:0.2rem;">${poi.name}</div>
            <div style="font-size:0.82rem;color:var(--text);">${poi.desc}</div>
          </div>
        `).join('')}
      </div>
    `;
  } else {
    poiContainer.innerHTML = '';
  }

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCityModal() {
  document.getElementById('cityModal').classList.remove('open');
  document.body.style.overflow = '';
}

// ----- Инициализация -----
document.addEventListener('DOMContentLoaded', async () => {
  let cities = [];

  try {
    const res = await fetch('data/cities.json');
    cities = await res.json();
  } catch (e) {
    console.error('Не удалось загрузить cities.json', e);
    return;
  }

  renderCities(cities);
  initMap(cities);

  document.getElementById('cityModalClose')?.addEventListener('click', closeCityModal);
  document.getElementById('cityModal')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) closeCityModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeCityModal();
  });
});
