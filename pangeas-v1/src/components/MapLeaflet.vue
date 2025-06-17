<template>
  <div id="map" class="map-container"></div>
</template>

<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { nextTick } from 'vue';


export default {
  name: 'MapLeaflet',
  props: {
    places: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      map: null
    };
  },
  watch: {
    places: {
      immediate: true,
      handler(newPlaces) {
        if (newPlaces.length > 0 && !this.map) {
          nextTick(() => {
            this.initMap(newPlaces);
          });
        }
      }
    }
  },
  methods: {
    initMap(places) {
      this.map = L.map('map').setView([47, 2], 6);
      L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap France'
      }).addTo(this.map);

      places.forEach(place => {
        if (place.coordinates) {
          const popupContent = `
            <div class="popup-card">
              <button class="popup-fav" onclick="this.classList.toggle('active')">
                <i class="fa-regular fa-heart popup-icon"></i>
              </button>
              <h5 class="mt-2">${place.name}</h5>
              <p class="mb-1 text-muted">${place.department} • ${place.distance_km} km</p>
              <img src="${place.image_url}" alt="${place.name}" class="popup-img" />
              <div class="d-flex justify-content-center gap-4 mt-2">
                <button class="btn btn-sm">Visiter</button>
                <button class="btn btn-sm">Détail</button>
              </div>
            </div>
          `;
          this.map.closePopup();
          L.marker([place.coordinates.lat, place.coordinates.lng])
              .addTo(this.map)
              .bindPopup(popupContent);
        }
      });
    }
  }
};
</script>


<style scoped>
.map-container {
  height: 100vh;
  width: 100%;
}

</style>
