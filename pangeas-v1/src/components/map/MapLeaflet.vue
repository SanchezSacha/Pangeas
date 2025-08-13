<template>
  <div id="map" class="map-container"></div>
</template>

<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import { nextTick } from 'vue';
import PlaceModal from './/PlaceModal.vue';
import ValidateVisitPopup from '../modal/ValidateVisitPopup.vue';
import haversine from 'haversine-distance';
import store from '../../store';
import { createApp } from 'vue';
import axios from "@/axios";

export default {
  name: 'MapLeaflet',
  props: {
    places: Array
  },
  data() {
    return {
      map: null,
      routeControl: null,
      validationInterval: null,
      popupInstance: null,
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

        this.routeControl.on('routesfound', () => {
          const container = document.querySelector('.leaflet-routing-container');
          if (container) container.remove();
        });

        this.markVisitAsOngoing(placeId, from, to);
      });

      L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap France'
      }).addTo(this.map);

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
    markVisitAsOngoing(placeId, from, to) {
      this.$store.commit('setCurrentVisit', { place_id: placeId });
      this.startValidationWatcher(placeId, to);
    },

    startValidationWatcher(placeId, destinationCoords) {
      if (this.validationInterval) clearInterval(this.validationInterval);

      this.validationInterval = setInterval(async () => {
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

  beforeUnmount() {
    if (this.validationInterval) clearInterval(this.validationInterval);
  },
  mounted() {
    if (!this.$store.state.userPosition && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
          (position) => {
            this.$store.commit('setUserPosition', {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          }
      );
    }
    axios.get('/api/visit/ongoing', { withCredentials: true })
        .then(async (res) => {
          const visit = res.data.visit;
          if (visit && visit.place_id) {
            const place = this.places.find(p => p._id === visit.place_id);
            const userPos = this.$store.state.userPosition;

            if (place && place.coordinates && userPos) {
              const from = { lat: userPos.lat, lng: userPos.lng };
              const to = {
                lat: place.coordinates.lat,
                lng: place.coordinates.lng
              };
              this.map.fire('start-route', {from, to, placeId: place._id});
              this.startValidationWatcher(place._id, to);
              this.$store.commit('setCurrentVisit', visit);
            }
          }
        })
        .catch(err => {
          console.error('Pas de visite en cours ou erreur :', err.response?.data || err.message);
        });

    const placeFromDetail = this.$store.state.visitPlaceFromDetail;
    if (placeFromDetail) {
      this.$store.commit('clearVisitPlaceFromDetail'); // reset après usage

      if (!navigator.geolocation) {
        alert("Géolocalisation non disponible.");
        return;
      }
      navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            this.$store.commit('setUserPosition', { lat: latitude, lng: longitude });

            const from = { lat: latitude, lng: longitude };
            const to = {
              lat: placeFromDetail.coordinates.lat,
              lng: placeFromDetail.coordinates.lng
            };

            this.map.setView([latitude, longitude], 30);
            this.map.fire('start-route', { from, to, placeId: placeFromDetail._id });

            axios.post('/api/visit/start', {
              place_id: placeFromDetail._id,
              user_lat: latitude,
              user_lng: longitude
            }, {
              withCredentials: true
            }).catch((err) => {
              console.error("Erreur lors du démarrage de la visite :", err.response?.data || err.message);
            });
          },
          (error) => {
            console.warn("Erreur de géolocalisation :", error.message);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
      );
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
