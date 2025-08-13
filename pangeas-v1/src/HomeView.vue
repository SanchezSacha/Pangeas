<template>
  <MapLeaflet :places="places" />
</template>

<script>
import MapLeaflet from './components/map/MapLeaflet.vue';

export default {
  name: 'HomeView',
  components: { MapLeaflet },
  props: {
    places: Array
  }
};
</script>
