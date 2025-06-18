<template>
  <div class="container-fluid p-0">
    <Sidebar
        @open-register="showRegisterModal"
        @open-login="showLoginModal"
    />
    <MapLeaflet :places="places" />
    <transition name="fade">
      <div class="modal-overlay" v-if="showRegistration">
        <div class="modal-content">
          <button class="close-modal" @click="animateClose('registration', $event)">×</button>
          <Registration />
        </div>
      </div>
    </transition>
    <transition name="fade">
      <div class="modal-overlay" v-if="showLogin">
        <div class="modal-content">
          <button class="close-modal" @click="animateClose('login', $event)">×</button>
          <Connexion @open-register-from-login="() => {
            showLogin = false;
            showRegistration = true;
          }"
          />
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
import Connexion from "./components/Form/Connexion.vue";

export default {
  name: 'App',
  components: {
    MapLeaflet,
    Sidebar,
    Registration,
    Connexion
  },
  data() {
    return {
      places: [],
      showRegistration: false,
      showLogin: false,
    };
  },
  methods: {
    showRegisterModal() {
      this.showRegistration = true;
    },
    showLoginModal() {
      this.showLogin = true;
    },
    animateClose(modalType, event) {
      const btn = event.currentTarget;
      btn.classList.add('closing-animation');

      setTimeout(() => {
        if (modalType === 'registration') this.showRegistration = false;
        if (modalType === 'login') this.showLogin = false;
        btn.classList.remove('closing-animation');
      }, 400);
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
/* Animation */
@keyframes pop-out {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(0.8);
    opacity: 0.6;
  }
  100% {
    transform: scale(1.1);
    opacity: 0;
  }
}

.closing-animation {
  animation: pop-out 0.4s forwards;
}

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

/* RESPONSIVE */

@media (max-width: 768px) {
  .modal-content {
    width: 90%;
    padding: 1.5rem;
    max-width: none;
  }
}

</style>
