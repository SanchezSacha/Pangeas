<template>
  <div id="wrapper">
    <SidebarAdmin :collapsed="sidebarCollapsed" @toggle="toggleSidebar" @navigate="closeSidebar"/>

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
import '@fortawesome/fontawesome-free/css/all.min.css';
import '@/assets/admin/sb-admin-2.min.css';
import SidebarAdmin from '@/admin/SidebarAdmin.vue';
import TopbarAdmin from '@/admin/TopbarAdmin.vue';

const store = useStore();
const user = computed(() => store.state.user || {});

const sidebarCollapsed = ref(window.innerWidth < 768);

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value;
}
function closeSidebar() {
  sidebarCollapsed.value = isDesktop.value ? false : true;
}

const width = ref(window.innerWidth);
const onResize = () => (width.value = window.innerWidth);
onMounted(() => window.addEventListener('resize', onResize));
onUnmounted(() => window.removeEventListener('resize', onResize));
const isDesktop = computed(() => width.value >= 768);
const showBackdrop = computed(() => !isDesktop.value && !sidebarCollapsed.value);
</script>

<style scoped>
.sidebar-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1040;
  overflow: hidden;
  background: rgba(20, 14, 12, 0.38);
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

:deep(.admin-actions-cell) {
  min-width: 8.5rem;
  white-space: nowrap;
}

:deep(.admin-actions) {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  flex-wrap: nowrap;
}

:deep(.admin-actions .btn) {
  display: inline-grid;
  place-items: center;
  flex: 0 0 2.1rem;
  width: 2.1rem;
  height: 2.1rem;
  margin: 0 !important;
  padding: 0;
}
</style>
