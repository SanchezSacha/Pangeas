<template>
  <ul class="list-group">
    <li v-for="place in places" :key="place.place_id" class="list-group-item d-flex align-items-center gap-3">
      <img :src="place.image_url || 'https://via.placeholder.com/60'" alt="" class="rounded" style="width: 60px; height: 60px; object-fit: cover;" />
      <div class="flex-grow-1">
        <h6 class="mb-1">{{ place.name }}</h6>
        <small>{{ place.category }} • {{ place.department }} • Visites : {{ place.visitCount }}</small>
      </div>
      <span class="badge bg-primary rounded-pill">{{ place.visitCount }}</span>
    </li>
  </ul>
</template>

<script setup>
const props = defineProps({
  places: {
    type: Array,
    required: true
  }
});
</script>

<style scoped>
.list-group-item {
  cursor: default;
}
</style>
