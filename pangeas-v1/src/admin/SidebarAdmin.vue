<template>
  <ul
      :class="['navbar-nav bg-gradient-primary sidebar sidebar-dark accordion',
      { 'toggled': collapsed }
    ]"
      id="accordionSidebar"
      :style="{ zIndex: 1050 }"
  >
    <router-link class="sidebar-brand d-flex align-items-center justify-content-center" to="/">
      <div class="sidebar-brand-icon">
        <img class="img-profile rounded-circle" :src="logo" style="width:52px;height:52px">
      </div>
      <div v-if="!collapsed" class="sidebar-brand-text mx-3">PANGEAS</div>
      <div v-else class="sidebar-brand-text mx-3">P</div>
    </router-link>

    <hr class="sidebar-divider my-0">

    <li :class="['nav-item', { active: isActive('/admin/dashboard') }]">
      <router-link class="nav-link" to="/admin/dashboard">
        <i class="fas fa-fw fa-tachometer-alt"></i>
        <span v-if="!collapsed">Tableau de bord</span>
      </router-link>
    </li>

    <li :class="['nav-item', { active: isActive('/admin/users') }]">
      <router-link class="nav-link" to="/admin/users">
        <i class="fas fa-fw fa-users"></i>
        <span v-if="!collapsed">Utilisateurs</span>
      </router-link>
    </li>

    <li :class="['nav-item', { active: isActive('/admin/places') }]">
      <router-link class="nav-link" to="/admin/places">
        <i class="fas fa-fw fa-map-marker-alt"></i>
        <span v-if="!collapsed">Lieux</span>
      </router-link>
    </li>

    <hr class="sidebar-divider d-none d-md-block">

    <div class="text-center d-none d-md-inline">
      <button class="rounded-circle border-0 toggle" id="sidebarToggle" @click="$emit('toggle')"></button>
    </div>
  </ul>
</template>

<script setup>
import { useRoute } from 'vue-router';
const props = defineProps({ collapsed: { type: Boolean, default: false }});
const route = useRoute();
const logo = '/logo_mobile_pangeas_blanc.png';


function isActive(path) {
  return route.path === path;
}
</script>

<style scoped>
@media (max-width: 767px) {
  .sidebar {
    transform: translateX(0);
    transition: transform 0.3s ease;
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
  }

  .sidebar.toggled {
    transform: translateX(-100%);
  }
}

</style>
