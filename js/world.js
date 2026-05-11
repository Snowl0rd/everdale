// world.js

function makeImg(src, imgClass, placeholderClass, icon) {
  if (src) {
    return '<img src="' + src + '" class="' + imgClass + '" alt="" loading="lazy" onerror="this.style.display=\'none\';this.nextSibling.style.display=\'flex\'">' +
           '<div class="' + placeholderClass + '" style="display:none">' + icon + '</div>';
  }
  return '<div class="' + placeholderClass + '">' + icon + '</div>';
}

function initMap(cities) {
  var mapEl = document.getElementById('everdale-map');
  if (!mapEl || typeof L === 'undefined') return;

  var imgW = 1280;
  var imgH = 1280;
  var bounds = [[0, 0], [imgH, imgW]];

  var map = L.map('everdale-map', {
    crs: L.CRS.Simple,
    minZoom: -2,
    maxZoom: 2,
    zoomSnap: 0.25,
    scrollWheelZoom: true
  });

  L.imageOverlay('images/map.jpg', bounds).addTo(map);
  map.fitBounds(bounds);

  var markerIcon = L.divIcon({
    className: '',
    html: '<div style="width:14px;height:14px;background:#c9a84c;border:2px solid #0d0b08;box-shadow:0 0 8px rgba(201,168,76,0.7);border-radius:50%;cursor:pointer;"></div>',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -12]
  });

  for (var i = 0; i < cities.length; i++) {
    (function(city) {
      var x = (city.mapX / 100) * imgW;
      var y = imgH - (city.mapY / 100) * imgH;
      var marker = L.marker([y, x], { icon: markerIcon }).addTo(map);
      var popupHtml =
        '<div class="map-popup__name">' + city.name + '</div>' +
        '<div class="map-popup__sub">' + city.subtitle + '</div>' +
        '<div class="map-popup__desc">' + city.description.substring(0, 120) + '...</div>';
      marker.bindPopup(popupHtml, { maxWidth: 260 });
    })(cities[i]);
  }
}

function renderCities(cities) {
  var grid = document.getElementById('citiesGrid');
  if (!grid) return;
  var html = '';
  for (var i = 0; i < cities.length; i++) {
    var city = cities[i];
    html += '<div class="city-card" data-id="' + city.id + '" id="city-' + city.id + '">' +
      makeImg(city.image, 'city-card__img', 'city-card__img-placeholder', '🏙️') +
      '<div class="city-card__body">' +
      '<div class="city-card__name">' + city.name + '</div>' +
      '<div class="city-card__subtitle">' + city.subtitle + '</div>' +
      '<p class="city-card__desc">' + city.description + '</p>' +
      '<div class="city-card__atmosphere">' + city.atmosphere + '</div>' +
      '</div></div>';
  }
  grid.innerHTML = html;

  var cards = grid.querySelectorAll('.city-card');
  for (var c = 0; c < cards.length; c++) {
    cards[c].addEventListener('click', (function(list) {
      return function() {
        var id = this.dataset.id;
        for (var n = 0; n < list.length; n++) {
          if (list[n].id === id) { openCityModal(list[n]); break; }
        }
      };
    })(cities));
  }
}

function openCityModal(city) {
  var overlay = document.getElementById('cityModal');
  document.getElementById('cityModalImg').innerHTML = makeImg(city.image, 'city-card__img', 'city-card__img-placeholder', '🏙️');
  document.getElementById('cityModalName').textContent = city.name;
  document.getElementById('cityModalSubtitle').textContent = city.subtitle;
  document.getElementById('cityModalDesc').textContent = city.description;
  document.getElementById('cityModalDetails').textContent = city.details || '';

  var poiHtml = '';
  if (city.pointsOfInterest && city.pointsOfInterest.length) {
    poiHtml = '<div style="margin-top:1.2rem;border-top:1px solid var(--border);padding-top:1rem;">' +
      '<h4 style="margin-bottom:0.8rem;font-size:0.7rem;letter-spacing:0.15em;color:var(--gold-dim);">// ТОЧКИ ИНТЕРЕСА</h4>';
    for (var i = 0; i < city.pointsOfInterest.length; i++) {
      var poi = city.pointsOfInterest[i];
      poiHtml += '<div style="margin-bottom:0.8rem;">' +
        '<div style="font-family:\'Cinzel\',serif;font-size:0.85rem;color:var(--gold2);margin-bottom:0.2rem;">' + poi.name + '</div>' +
        '<div style="font-size:0.82rem;color:var(--text);">' + poi.desc + '</div>' +
        '</div>';
    }
    poiHtml += '</div>';
  }
  document.getElementById('cityModalPOI').innerHTML = poiHtml;

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCityModal() {
  document.getElementById('cityModal').classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', function() {
  fetch('data/cities.json')
    .then(function(r) { return r.json(); })
    .then(function(cities) {
      renderCities(cities);
      initMap(cities);
      document.getElementById('cityModalClose').addEventListener('click', closeCityModal);
      document.getElementById('cityModal').addEventListener('click', function(e) {
        if (e.target === this) closeCityModal();
      });
      document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeCityModal(); });
    })
    .catch(function(e) { console.error('cities.json error', e); });
});
