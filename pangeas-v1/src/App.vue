<template>
  <div class="container-fluid p-0">
    <MapLeaflet :places="places" />
  </div>
</template>

<script>
import axios from 'axios';
import MapLeaflet from "./components/MapLeaflet.vue";

export default {
  name: 'App',
  components: {
    MapLeaflet
  },
  data() {
    return {
      places: []
    };
  },
  async mounted() {
    try {
      const res = await axios.get('http://localhost:3000/accueil');
      this.places = res.data;
    } catch (err) {
      console.error('Erreur lors du chargement des lieux :', err.message);
    }
  }
};
</script>
