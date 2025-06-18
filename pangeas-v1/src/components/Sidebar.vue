<template>
  <div>
    <button class="burger-btn" @click="toggleMenu" v-if="!isOpen">
      <img src="/icons/menu.svg" alt="Menu" />
    </button>

    <transition name="slide">
      <div class="sidebar" v-if="isOpen">
        <button class="close-btn" @click="toggleMenu">×</button>
        <ul>
          <li :class="{ active: active === 'login' }" @click="active = 'login'">
            <img src="/icons/log-in.svg" alt="Connexion" />
            Connexion
          </li>
          <li :class="{ active: active === 'register' }"
              @click="openRegister">
            <img src="/icons/user-round-plus.svg" alt="Inscription" />
            Inscription
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>


<script>
export default {
  name: 'Sidebar',
  data() {
    return {
      isOpen: false,
      active: null,
    };
  },
  methods: {
    toggleMenu() {
      this.isOpen = !this.isOpen;
    },
    openRegister() {
      this.active = 'register';
      this.$emit('open-register');
      this.isOpen = false;
    }
  }
}
</script>

<style scoped>

/* Animations */

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from {
  transform: translateX(100%);
}
.slide-enter-to {
  transform: translateX(0%);
}
.slide-leave-from {
  transform: translateX(0%);
}
.slide-leave-to {
  transform: translateX(100%);
}

/* Icon menu*/

.burger-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: var(--color-brown);
  border: none;
  border-radius: 50%;
  padding: 0.6rem;
  width: 48px;
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.burger-btn img {
  width: 24px;
  height: 24px;
  filter: brightness(0) saturate(100%) invert(100%);
}

/* Sidebar */

.sidebar {
  position: fixed;
  top: 0;
  right: 0;
  width: 200px;
  height: 100vh;
  background-color: var(--color-beige);
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  border-bottom-left-radius: 12px;
  padding-top: 3rem;
}

.sidebar .close-btn {
  position: absolute;
  top: 1px;
  right: 10px;
  background: none;
  border: none;
  font-size: 40px;
  cursor: pointer;
  color: var(--color-brown);
}

.sidebar ul {
  list-style: none;
  padding: 20px 0;
  margin: 0;
}

.sidebar li {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  font-weight: bold;
  color: var(--color-brown);
  cursor: pointer;
  transition: background 0.2s;
}

.sidebar li img {
  margin-right: 10px;
}

.sidebar li.active img {
  filter: brightness(0) saturate(100%) invert(100%);
}
.sidebar li.active {
  background-color: var(--color-brown);
  color: var(--color-white);
  border-top-right-radius: 20px;
  border-bottom-right-radius: 20px;
}


/* Mobile */

@media screen and (max-width: 767px) {
  .sidebar {
    width: 33.333vw;
    min-width: 140px;
  }
  .burger-btn {
    top: 0.5rem;
    right: 0.5rem;
    width: 40px;
    height: 40px;
    padding: 0.4rem;
  }

  .burger-btn img {
    width: 20px;
    height: 20px;
  }
}

</style>
