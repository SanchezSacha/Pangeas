<template>
  <div id="map" class="map-container"></div>
</template>

<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import { nextTick, h, render } from 'vue';
import PlaceModal from '../Map/PlaceModal.vue';
import store from '../../store';
import { createApp } from 'vue';
import axios from "axios";

export default {
  name: 'MapLeaflet',
  props: {
    places: Array
  },
  data() {
    return {
      map: null,
      routeControl: null
    };
  },
  methods: {
    initMap(places) {
      this.map = L.map('map').setView([47, 2], 6);

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

        this.markVisitAsOngoing(placeId, from, to);
      });

      // Tiles
      L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap France'
      }).addTo(this.map);

      // Popups
      places.forEach(place => {
        if (place.coordinates) {
          const popupContainer = document.createElement('div');
          const popupApp = createApp(PlaceModal, { place, map: this.map });
          popupApp.use(store);
          popupApp.mount(popupContainer);

          L.marker([place.coordinates.lat, place.coordinates.lng])
              .addTo(this.map)
              .bindPopup(popupContainer);
        }
      });
    },
    markVisitAsOngoing(placeId, from, to) {
      const userId = this.$store.state.user?.id;
      if (!userId) return;

      axios.post('http://localhost:3000/api/visit/start', {
        user_id: userId,
        place_id: placeId,
        user_lat: from.lat,
        user_lng: from.lng
      }, { withCredentials: true })
          .then(res => console.log('Visite passée en ongoing'))
          .catch(err => console.error('Erreur:', err));
    },
    created() {
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
          createMarker: () => null
        }).addTo(this.map);

        this.markVisitAsOngoing(placeId, from, to);
      });

    }
  },
  watch: {
    places: {
      immediate: true,
      handler(newPlaces) {
        if (newPlaces.length && !this.map) {
          nextTick(() => this.initMap(newPlaces));
        }
      }
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
