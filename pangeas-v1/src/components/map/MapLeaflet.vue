<template>
  <div id="map" class="map-container"></div>
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
      clusterMaxZoom: 15,
      clusterRadius: 48,
    };
  },
  methods: {
    initMap(places = []) {
      if (this.map) {
        this.renderPlaces(places);
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
      const popupContainer = document.createElement('div');
      const popupApp = createApp(PlaceModal, { place, map: this.map });

      popupApp.use(store);
      popupApp.mount(popupContainer);

      L.marker([lat, lng])
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
