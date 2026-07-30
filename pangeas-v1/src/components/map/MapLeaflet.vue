<template>
  <div class="map-shell">
    <div class="map-search-panel">
      <div class="map-search" role="search">
        <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
        <input
            v-model.trim="searchQuery"
            type="search"
            placeholder="Rechercher un lieu"
            aria-label="Rechercher un lieu par nom, département ou catégorie"
        />
        <button
            v-if="searchQuery"
            type="button"
            aria-label="Effacer la recherche"
            @click="clearSearch"
        >
          <i class="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
        <small v-if="hasActiveFilters">
          {{ filteredPlaces.length }} résultat{{ filteredPlaces.length > 1 ? 's' : '' }}
        </small>
      </div>

      <div class="map-category-filters" aria-label="Filtres par catégorie">
        <button
            v-for="filter in categoryFilters"
            :key="filter.key"
            type="button"
            :class="{ active: isCategorySelected(filter.key) }"
            :aria-pressed="isCategorySelected(filter.key)"
            @click="toggleCategoryFilter(filter.key)"
        >
          <i :class="filter.icon" aria-hidden="true"></i>
          <span>{{ filter.label }}</span>
        </button>
      </div>
    </div>

    <p v-if="hasActiveFilters && filteredPlaces.length === 0" class="map-search-empty">
      Aucun lieu trouvé
    </p>

    <div id="map" class="map-container"></div>
  </div>
</template>

<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import { nextTick } from 'vue';
import PlaceModal from './PlaceModal.vue';
import ValidateVisitPopup from '../modal/ValidateVisitPopup.vue';
import haversine from 'haversine-distance';
import store from '../../store';
import { createApp } from 'vue';
import axios from '@/axios';

const placeMarkerTypes = {
  nature: {
    label: 'Nature',
    icon: 'fa-solid fa-tree',
    className: 'nature',
  },
  historique: {
    label: 'Historique',
    icon: 'fa-solid fa-landmark',
    className: 'historic',
  },
  historical: {
    label: 'Historique',
    icon: 'fa-solid fa-landmark',
    className: 'historic',
  },
  urbain: {
    label: 'Urbain',
    icon: 'fa-solid fa-building',
    className: 'urban',
  },
  urban: {
    label: 'Urbain',
    icon: 'fa-solid fa-building',
    className: 'urban',
  },
  frisson: {
    label: 'Frisson',
    icon: 'fa-solid fa-ghost',
    className: 'thrill',
  },
  spooky: {
    label: 'Frisson',
    icon: 'fa-solid fa-ghost',
    className: 'thrill',
  },
  secret: {
    label: 'Secret',
    icon: 'fa-solid fa-question',
    className: 'secret',
  },
};

const fallbackMarkerType = {
  label: 'Lieu',
  icon: 'fa-solid fa-location-dot',
  className: 'default',
};

const categoryAliases = {
  historical: 'historique',
  urban: 'urbain',
  spooky: 'frisson',
};

const categoryFilterOptions = [
  {
    key: 'nature',
    label: 'Nature',
    icon: 'fa-solid fa-tree',
  },
  {
    key: 'historique',
    label: 'Historique',
    icon: 'fa-solid fa-landmark',
  },
  {
    key: 'urbain',
    label: 'Urbain',
    icon: 'fa-solid fa-building',
  },
  {
    key: 'frisson',
    label: 'Frisson',
    icon: 'fa-solid fa-ghost',
  },
  {
    key: 'secret',
    label: 'Secret',
    icon: 'fa-solid fa-question',
  },
];

const normalizeCategory = (category = '') => String(category)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const normalizePlaceCategory = (category = '') => {
  const normalizedCategory = normalizeCategory(category);
  return categoryAliases[normalizedCategory] || normalizedCategory;
};

export default {
  name: 'MapLeaflet',
  props: {
    places: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      map: null,
      markersLayer: null,
      routeControl: null,
      validationInterval: null,
      popupInstance: null,
      ongoingVisit: null,
      displayedPlaces: [],
      searchQuery: '',
      selectedCategories: [],
      categoryFilters: categoryFilterOptions,
      clusterMaxZoom: 15,
      clusterRadius: 48,
    };
  },
  computed: {
    normalizedSearchQuery() {
      return normalizeCategory(this.searchQuery);
    },
    shouldFilterPlaces() {
      return this.normalizedSearchQuery.length >= 3;
    },
    hasCategoryFilters() {
      return this.selectedCategories.length > 0;
    },
    hasActiveFilters() {
      return this.shouldFilterPlaces || this.hasCategoryFilters;
    },
    filteredPlaces() {
      return this.places.filter(place => (
          this.matchesCategoryFilters(place) && this.matchesPlaceSearch(place)
      ));
    },
  },
  methods: {
    initMap(places = []) {
      if (this.map) {
        this.renderPlaces(this.filteredPlaces);
        return;
      }

      this.map = L.map('map').setView([47, 2], 6);

      L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap France'
      }).addTo(this.map);

      this.markersLayer = L.layerGroup().addTo(this.map);
      this.registerMapEvents();
      this.renderPlaces(places);
    },
    clearSearch() {
      this.searchQuery = '';
    },
    isCategorySelected(category) {
      return this.selectedCategories.includes(category);
    },
    toggleCategoryFilter(category) {
      this.selectedCategories = this.isCategorySelected(category)
          ? this.selectedCategories.filter(selectedCategory => selectedCategory !== category)
          : [...this.selectedCategories, category];
    },
    matchesCategoryFilters(place) {
      if (!this.hasCategoryFilters) return true;
      return this.selectedCategories.includes(normalizePlaceCategory(place?.category));
    },
    matchesPlaceSearch(place) {
      if (!this.shouldFilterPlaces) return true;

      const searchableValues = [
        place?.name,
        place?.department,
        place?.region,
        place?.category,
      ];

      return searchableValues.some(value =>
          normalizeCategory(value).includes(this.normalizedSearchQuery)
      );
    },
    focusFilteredPlaces() {
      if (!this.map || !this.hasActiveFilters || this.filteredPlaces.length === 0) return;

      const bounds = L.latLngBounds([]);

      this.filteredPlaces.forEach(place => {
        const lat = Number(place.coordinates?.lat);
        const lng = Number(place.coordinates?.lng);
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          bounds.extend([lat, lng]);
        }
      });

      if (!bounds.isValid()) return;

      if (this.filteredPlaces.length === 1) {
        const center = bounds.getCenter();
        this.map.setView(center, Math.max(this.map.getZoom(), 13), { animate: true });
        return;
      }

      this.map.fitBounds(bounds, {
        animate: true,
        paddingTopLeft: [70, 110],
        paddingBottomRight: [70, 90],
        maxZoom: 12,
      });
    },
    applyPlacesFilter() {
      if (!this.map) return;
      this.map.closePopup();
      this.renderPlaces(this.filteredPlaces, false);
      this.focusFilteredPlaces();
    },
    registerMapEvents() {
      this.map.on('zoomend moveend', () => {
        this.renderPlaces(this.displayedPlaces, false);
      });

      this.map.on('start-route', (e) => {
        const { from, to, placeId } = e;

        if (this.routeControl) {
          this.map.removeControl(this.routeControl);
        }

        this.routeControl = L.Routing.control({
          waypoints: [
            L.latLng(from.lat, from.lng),
            L.latLng(to.lat, to.lng)
          ],
          routeWhileDragging: false,
          addWaypoints: false,
          createMarker: () => null,
        }).addTo(this.map);

        this.routeControl.on('routesfound', () => {
          const container = document.querySelector('.leaflet-routing-container');
          if (container) container.remove();
        });

        this.markVisitAsOngoing(placeId, to);
      });

      this.map.on('cancel-route', () => {
        if (this.routeControl) {
          this.map.removeControl(this.routeControl);
          this.routeControl = null;
        }
        if (this.validationInterval) {
          clearInterval(this.validationInterval);
          this.validationInterval = null;
        }
        if (this.popupInstance) {
          this.map.closePopup();
          this.popupInstance = null;
        }
        this.map.setView([47, 2], 6);
      });
    },
    renderPlaces(places = [], shouldResumeVisit = true) {
      if (!this.map || !this.markersLayer) return;

      this.displayedPlaces = places;
      this.markersLayer.clearLayers();

      this.buildPlaceGroups(places).forEach(group => {
        if (group.places.length === 1) {
          this.addPlaceMarker(group.places[0]);
          return;
        }

        this.addClusterMarker(group);
      });

      if (shouldResumeVisit) {
        this.resumeOngoingVisit();
      }
    },
    buildPlaceGroups(places = []) {
      const validPlaces = places
          .map(place => ({
            place,
            lat: Number(place.coordinates?.lat),
            lng: Number(place.coordinates?.lng),
          }))
          .filter(({ lat, lng }) => Number.isFinite(lat) && Number.isFinite(lng));

      if (this.map.getZoom() >= this.clusterMaxZoom) {
        return validPlaces.map(({ place, lat, lng }) => ({
          places: [place],
          lat,
          lng,
          bounds: L.latLngBounds([[lat, lng]])
        }));
      }

      return validPlaces.reduce((groups, item) => {
        const point = this.map.latLngToLayerPoint([item.lat, item.lng]);
        const existingGroup = groups.find(group => point.distanceTo(group.point) <= this.clusterRadius);

        if (!existingGroup) {
          groups.push({
            places: [item.place],
            lat: item.lat,
            lng: item.lng,
            point,
            bounds: L.latLngBounds([[item.lat, item.lng]])
          });
          return groups;
        }

        existingGroup.places.push(item.place);
        existingGroup.lat = (existingGroup.lat * (existingGroup.places.length - 1) + item.lat) / existingGroup.places.length;
        existingGroup.lng = (existingGroup.lng * (existingGroup.places.length - 1) + item.lng) / existingGroup.places.length;
        existingGroup.point = this.map.latLngToLayerPoint([existingGroup.lat, existingGroup.lng]);
        existingGroup.bounds.extend([item.lat, item.lng]);

        return groups;
      }, []);
    },
    addPlaceMarker(place) {
      const lat = Number(place.coordinates?.lat);
      const lng = Number(place.coordinates?.lng);
      const markerType = placeMarkerTypes[normalizeCategory(place.category)] || fallbackMarkerType;
      const popupContainer = document.createElement('div');
      const popupApp = createApp(PlaceModal, { place, map: this.map });
      const markerIcon = L.divIcon({
        className: `place-marker place-marker-${markerType.className}`,
        html: `<span class="place-marker-pin" aria-hidden="true"><i class="${markerType.icon}"></i></span>`,
        iconSize: [44, 50],
        iconAnchor: [22, 46],
        popupAnchor: [0, -42],
      });

      popupApp.use(store);
      popupApp.mount(popupContainer);

      L.marker([lat, lng], {
        icon: markerIcon,
        title: `${place.name || 'Lieu'} - ${markerType.label}`,
        keyboard: true,
      })
          .addTo(this.markersLayer)
          .bindPopup(popupContainer);
    },
    addClusterMarker(group) {
      const clusterIcon = L.divIcon({
        className: 'place-cluster',
        html: `<span>${group.places.length}</span>`,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      L.marker([group.lat, group.lng], { icon: clusterIcon })
          .addTo(this.markersLayer)
          .on('click', () => this.expandCluster(group));
    },
    expandCluster(group) {
      if (!group.bounds.isValid() || group.bounds.getNorthEast().equals(group.bounds.getSouthWest())) {
        this.map.setView([group.lat, group.lng], this.clusterMaxZoom, { animate: true });
        return;
      }

      this.map.fitBounds(group.bounds, {
        animate: true,
        padding: [70, 70],
        maxZoom: this.clusterMaxZoom
      });
    },
    markVisitAsOngoing(placeId, destinationCoords) {
      this.$store.commit('setCurrentVisit', { place_id: placeId });
      this.startValidationWatcher(placeId, destinationCoords);
    },
    loadOngoingVisit() {
      axios.get('/api/visit/ongoing', { withCredentials: true })
          .then((res) => {
            const visit = res.data.visit;
            if (!visit?.place_id) return;

            this.ongoingVisit = visit;
            this.$store.commit('setCurrentVisit', visit);
            this.resumeOngoingVisit();
          })
          .catch(err => {
            console.error('Pas de visite en cours ou erreur :', err.response?.data || err.message);
          });
    },
    resumeOngoingVisit() {
      if (!this.map || !this.ongoingVisit?.place_id || !this.places.length) return;

      const place = this.places.find(p => p._id === this.ongoingVisit.place_id);
      const userPos = this.$store.state.userPosition;
      const lat = Number(place?.coordinates?.lat);
      const lng = Number(place?.coordinates?.lng);

      if (!place || !userPos || !Number.isFinite(lat) || !Number.isFinite(lng)) return;

      const from = { lat: userPos.lat, lng: userPos.lng };
      const to = { lat, lng };

      this.map.fire('start-route', { from, to, placeId: place._id });
    },
    handlePlaceFromDetail() {
      const placeFromDetail = this.$store.state.visitPlaceFromDetail;
      if (!placeFromDetail) return;

      this.$store.commit('clearVisitPlaceFromDetail');

      if (!navigator.geolocation) {
        alert('Geolocalisation non disponible.');
        return;
      }

      navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const destinationLat = Number(placeFromDetail.coordinates?.lat);
            const destinationLng = Number(placeFromDetail.coordinates?.lng);

            if (!Number.isFinite(destinationLat) || !Number.isFinite(destinationLng)) {
              console.warn('Coordonnees du lieu invalides.');
              return;
            }

            this.$store.commit('setUserPosition', { lat: latitude, lng: longitude });

            const from = { lat: latitude, lng: longitude };
            const to = {
              lat: destinationLat,
              lng: destinationLng
            };

            this.map.setView([latitude, longitude], 16);
            this.map.fire('start-route', { from, to, placeId: placeFromDetail._id });

            axios.post('/api/visit/start', {
              place_id: placeFromDetail._id,
              user_lat: latitude,
              user_lng: longitude
            }, {
              withCredentials: true
            }).catch((err) => {
              console.error('Erreur lors du demarrage de la visite :', err.response?.data || err.message);
            });
          },
          (error) => {
            console.warn('Erreur de geolocalisation :', error.message);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
      );
    },
    startValidationWatcher(placeId, destinationCoords) {
      if (this.validationInterval) clearInterval(this.validationInterval);

      this.validationInterval = setInterval(() => {
        const userPos = this.$store.state.userPosition;
        if (!userPos) return;

        const userCoords = {
          latitude: userPos.lat,
          longitude: userPos.lng
        };
        const destCoords = {
          latitude: destinationCoords.lat,
          longitude: destinationCoords.lng
        };
        const distance = haversine(userCoords, destCoords);

        if (distance <= 50) {
          clearInterval(this.validationInterval);
          const container = document.createElement('div');
          const popupApp = createApp(ValidateVisitPopup, {
            placeId,
            userCoords,
            onValidated: () => {
              this.map.closePopup();
              window.location.href = '/';
            }
          });
          popupApp.use(store);
          popupApp.mount(container);

          this.popupInstance = L.popup()
              .setLatLng([destinationCoords.lat, destinationCoords.lng])
              .setContent(container)
              .openOn(this.map);
        }
      }, 3000);
    },
  },

  mounted() {
    nextTick(() => {
      this.initMap(this.places);
      this.loadOngoingVisit();
      this.handlePlaceFromDetail();
    });

    if (!this.$store.state.userPosition && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
          (position) => {
            this.$store.commit('setUserPosition', {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
            this.resumeOngoingVisit();
          }
      );
    }
  },
  beforeUnmount() {
    if (this.validationInterval) clearInterval(this.validationInterval);
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  },
  watch: {
    places: {
      handler(newPlaces) {
        nextTick(() => this.initMap(newPlaces));
      }
    },
    searchQuery() {
      nextTick(() => this.applyPlacesFilter());
    },
    selectedCategories() {
      nextTick(() => this.applyPlacesFilter());
    }
  }
};
</script>

<style scoped>
.map-shell {
  position: relative;
  min-height: 100vh;
}

.map-container {
  height: 100vh;
  width: 100%;
}

.map-search-panel {
  position: absolute;
  top: 1rem;
  z-index: 1000;
  left: calc(50% + 2.2rem);
  width: min(31rem, calc(100vw - 7rem));
  transform: translateX(-50%);
}

.map-search {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  column-gap: 0.65rem;
  width: 100%;
  min-height: 3.25rem;
  padding: 0.42rem 0.7rem 0.42rem 0.95rem;
  border: 1px solid color-mix(in srgb, var(--color-pangeas-line) 76%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-pangeas-bg) 94%, transparent);
  color: var(--color-pangeas-primary);
  box-shadow: 0 12px 30px rgba(68, 42, 34, 0.14);
  backdrop-filter: blur(12px);
}

.map-search input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--color-auth-text);
  font-family: var(--font-content);
  font-size: 0.94rem;
  font-weight: 800;
}

.map-search input::placeholder {
  color: var(--color-pangeas-muted);
  opacity: 0.78;
}

.map-search button {
  display: grid;
  place-items: center;
  width: 2.1rem;
  height: 2.1rem;
  border: 0;
  border-radius: 999px;
  background: var(--color-pangeas-surface);
  color: var(--color-pangeas-primary);
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.map-search button:hover {
  background: var(--color-pangeas-primary);
  color: var(--color-pangeas-bg);
  transform: translateY(-1px);
}

.map-search small {
  grid-column: 2 / 4;
  margin-top: -0.18rem;
  color: var(--color-pangeas-muted);
  font-size: 0.72rem;
  font-weight: 900;
  line-height: 1;
}

.map-category-filters {
  display: flex;
  gap: 0.45rem;
  width: 100%;
  margin-top: 0.55rem;
  overflow-x: auto;
  padding: 0.1rem 0.05rem 0.35rem;
  scrollbar-width: none;
}

.map-category-filters::-webkit-scrollbar {
  display: none;
}

.map-category-filters button {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 2.35rem;
  padding: 0.45rem 0.72rem;
  border: 1px solid color-mix(in srgb, var(--color-pangeas-line) 72%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-pangeas-bg) 95%, transparent);
  color: var(--color-pangeas-primary);
  box-shadow: 0 8px 18px rgba(68, 42, 34, 0.1);
  font-size: 0.76rem;
  font-weight: 900;
  white-space: nowrap;
  backdrop-filter: blur(10px);
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
}

.map-category-filters button:hover {
  border-color: var(--color-pangeas-primary-soft);
  transform: translateY(-1px);
}

.map-category-filters button.active {
  border-color: var(--color-pangeas-primary);
  background: var(--color-pangeas-primary);
  color: var(--color-pangeas-bg);
}

.map-category-filters i {
  font-size: 0.82rem;
}

.map-search-empty {
  position: absolute;
  top: 7.85rem;
  left: calc(50% + 2.2rem);
  z-index: 1000;
  margin: 0;
  padding: 0.55rem 0.85rem;
  border: 1px solid color-mix(in srgb, var(--color-pangeas-line) 68%, transparent);
  border-radius: 999px;
  background: var(--color-pangeas-bg);
  color: var(--color-pangeas-primary);
  font-size: 0.82rem;
  font-weight: 900;
  box-shadow: 0 10px 24px rgba(68, 42, 34, 0.12);
  transform: translateX(-50%);
}

@media (max-width: 767px) {
  .map-search-panel {
    top: 0.75rem;
    left: 4.1rem;
    right: 0.75rem;
    width: auto;
    transform: none;
  }

  .map-search {
    min-height: 3rem;
  }

  .map-search-empty {
    top: 7.25rem;
    left: 4.1rem;
    right: 0.75rem;
    text-align: center;
    transform: none;
  }
}
</style>
