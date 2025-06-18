<template>
  <div class="container-fluid p-0">
    <Sidebar @open-register="showRegisterModal" />
    <MapLeaflet :places="places" />

    <transition name="fade">
      <div class="modal-overlay" v-if="showRegistration">
        <div class="modal-content">
          <button class="close-modal" @click="showRegistration = false">×</button>
          <Registration />
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from 'axios';
import MapLeaflet from "./components/MapLeaflet.vue";
import Sidebar from "./components/Sidebar.vue";
import Registration from "./components/Form/Registration.vue";

export default {
  name: 'App',
  components: {
    MapLeaflet,
    Sidebar,
    Registration
  },
  data() {
    return {
      places: [],
      showRegistration: false
    };
  },
  methods: {
    showRegisterModal() {
      this.showRegistration = true;
    }
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

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1200;
}

.modal-content {
  background: var(--color-beige);
  border-radius: 16px;
  padding: 2rem;
  position: relative;
  max-width: 45%;
  max-height: 90vh;
  overflow-y: auto;
}

.close-modal {
  position: absolute;
  top: 1px;
  right: 16px;
  font-size: 50px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-brown);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
