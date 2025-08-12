<template>
  <div id="wrapper">
    <SidebarAdmin :collapsed="sidebarCollapsed" @toggle="toggleSidebar"/>

    <div id="content-wrapper" class="d-flex flex-column" :class="{ 'sidebar-toggled': sidebarCollapsed }">
      <div id="content">
        <TopbarAdmin :user="user" @toggle="toggleSidebar" />

        <div class="container-fluid py-4">
          <router-view />
        </div>
      </div>
    </div>

    <div v-if="showBackdrop" class="sidebar-backdrop" @click="closeSidebar"/>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import SidebarAdmin from '@/admin/SidebarAdmin.vue';
import TopbarAdmin from '@/admin/TopbarAdmin.vue';

const store = useStore();
const user = computed(() => store.state.user || {});

const sidebarCollapsed = ref(false);

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value;
}
function closeSidebar() {
  sidebarCollapsed.value = false;
}

const width = ref(window.innerWidth);
const onResize = () => (width.value = window.innerWidth);
onMounted(() => window.addEventListener('resize', onResize));
onUnmounted(() => window.removeEventListener('resize', onResize));
const isDesktop = computed(() => width.value >= 768);
const showBackdrop = computed(() => !isDesktop.value && sidebarCollapsed.value);
</script>

<style scoped>
.sidebar-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1060;
  overflow: hidden;
}

#content-wrapper.sidebar-toggled {
  margin-left: 4.5rem;
}

@media (max-width: 767px) {
  #wrapper {
    display: block;
  }
  #content-wrapper {
    margin-left: 0 !important;
  }
}
</style>
