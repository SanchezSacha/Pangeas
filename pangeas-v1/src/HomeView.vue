<template>
  <MapLeaflet :places="places" @propose-place="$emit('propose-place')" />
</template>

<script>
import MapLeaflet from './components/map/MapLeaflet.vue';

export default {
  name: 'HomeView',
  components: { MapLeaflet },
  emits: ['propose-place'],
  props: {
    places: Array
  }
};
</script>
