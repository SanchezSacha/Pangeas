<template>
  <MapLeaflet :places="places" />
</template>

<script>
import MapLeaflet from './components/Map/MapLeaflet.vue';

export default {
  name: 'HomeView',
  components: { MapLeaflet },
  props: {
    places: Array
  }
};
</script>
