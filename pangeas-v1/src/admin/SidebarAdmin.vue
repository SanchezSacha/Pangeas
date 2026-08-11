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
      <router-link class="nav-link" to="/admin/dashboard" @click="$emit('navigate')">
        <i class="fas fa-fw fa-tachometer-alt"></i>
        <span v-if="!collapsed">Tableau de bord</span>
      </router-link>
    </li>

    <li :class="['nav-item', { active: isActive('/admin/users') }]">
      <router-link class="nav-link" to="/admin/users" @click="$emit('navigate')">
        <i class="fas fa-fw fa-users"></i>
        <span v-if="!collapsed">Utilisateurs</span>
      </router-link>
    </li>

    <li :class="['nav-item', { active: isActive('/admin/places') }]">
      <router-link class="nav-link" to="/admin/places" @click="$emit('navigate')">
        <i class="fas fa-fw fa-map-marker-alt"></i>
        <span v-if="!collapsed">Lieux</span>
      </router-link>
    </li>

    <li :class="['nav-item', { active: route.path.startsWith('/admin/place-submissions') }]">
      <router-link class="nav-link" to="/admin/place-submissions" @click="$emit('navigate')">
        <i class="fas fa-fw fa-inbox"></i>
        <span v-if="!collapsed">Propositions</span>
      </router-link>
    </li>

    <li :class="['nav-item', { active: isActive('/admin/rewards') }]">
      <router-link class="nav-link" to="/admin/rewards" @click="$emit('navigate')">
        <i class="fas fa-fw fa-gift"></i>
        <span v-if="!collapsed">Récompenses</span>
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
    width: min(82vw, 18rem) !important;
    transform: translateX(0);
    transition: transform 0.3s ease;
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    box-shadow: 1rem 0 2.5rem rgba(25, 18, 16, 0.22);
  }

  .sidebar.toggled {
    transform: translateX(-100%);
  }

  .sidebar .sidebar-brand {
    width: 100%;
    min-height: 5.5rem;
    padding-inline: 1.1rem;
  }

  .sidebar .sidebar-brand-icon img {
    width: 3.4rem !important;
    height: 3.4rem !important;
  }

  .sidebar .sidebar-brand-text {
    font-size: 1.05rem;
    letter-spacing: 0.08em;
  }

  .sidebar .nav-item {
    width: 100%;
  }

  .sidebar .nav-item .nav-link {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    width: calc(100% - 1rem);
    min-height: 3.6rem;
    margin: 0.2rem 0.5rem;
    padding: 0.85rem 1rem !important;
    border-radius: 0.65rem;
    text-align: left !important;
  }

  .sidebar .nav-item .nav-link i {
    width: 1.5rem;
    margin: 0 !important;
    font-size: 1.1rem;
    text-align: center;
  }

  .sidebar .nav-item .nav-link span {
    font-size: 0.95rem !important;
    font-weight: 700;
  }
}

</style>
