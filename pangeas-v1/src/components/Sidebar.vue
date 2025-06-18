<template>
  <div>
    <button class="burger-btn" @click="toggleMenu" v-if="!isOpen">
      <img src="/icons/menu.svg" alt="Menu" />
    </button>

    <transition name="menu-fade">
      <div class="sidebar" v-if="isOpen">
        <button class="close-btn" @click="toggleMenu">×</button>
        <ul>
          <li :class="{ active: active === 'login' }" @click="openLogin">
            <img src="/icons/log-in.svg" alt="Connexion" />
            Connexion
          </li>
          <li :class="{ active: active === 'register' }" @click="openRegister">
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
    },
    openLogin() {
      this.active = 'login';
      this.$emit('open-login');
      this.isOpen = false;
    }
  }
}
</script>

<style scoped>

/* Animations */

.menu-fade-enter-active {
  animation: sidebarIn 0.4s ease forwards;
}
.menu-fade-leave-active {
  animation: sidebarOut 0.3s ease forwards;
}

@keyframes sidebarIn {
  0% {
    opacity: 0;
    transform: translateX(100%) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateX(0%) scale(1);
  }
}

@keyframes sidebarOut {
  0% {
    opacity: 1;
    transform: translateX(0%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateX(100%) scale(0.95);
  }
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
  transition: transform 0.3s ease, background-color 0.3s ease;
}

.burger-btn:hover {
  transform: rotate(90deg) scale(1.05);
  background-color: #5d4037;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.burger-btn:active {
  transform: scale(0.95);
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
  position: relative;
  display: flex;
  align-items: center;
  padding: 12px 20px;
  font-weight: bold;
  color: var(--color-brown);
  cursor: pointer;
  overflow: hidden;
  z-index: 1;
  transition: color 0.3s ease, transform 0.2s ease;
}

.sidebar li:not(.active)::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background-color:#8B5E3C;
  z-index: -1;
  transition: left 0.4s ease;
  border-top-right-radius: 20px;
  border-bottom-right-radius: 20px;
}

.sidebar li:hover::before {
  left: 0;
}

.sidebar li:not(.active):hover {
  color: var(--color-white);
  transform: translateY(-1px);
}

.sidebar li:not(.active):active {
  transform: scale(0.97);
}

.sidebar li img {
  margin-right: 10px;
  transition: filter 0.3s ease;
}

.sidebar li:hover img {
  filter: brightness(0) saturate(100%) invert(100%);
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

  .sidebar li {
    padding-left: 12px;
    padding-right: 12px;
  }

  .sidebar ul {
    margin: 0;
  }
}

</style>
