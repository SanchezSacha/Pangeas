<template>
  <nav class="mobile-bottom-nav" :class="{ guest: !isLoggedIn }" aria-label="Navigation mobile">
    <router-link :class="{ active: isActive('Home') }" :to="{ name: 'Home' }">
      <img src="/icons/map.svg" alt="" aria-hidden="true" />
      <span>Explorer</span>
    </router-link>

    <template v-if="isLoggedIn">
      <router-link :class="{ active: isActive('MonCompte') }" :to="{ name: 'MonCompte' }">
        <img src="/icons/heart.svg" alt="" aria-hidden="true" />
        <span>Favoris</span>
      </router-link>

      <router-link :class="{ active: isActive('Recompenses') }" :to="{ name: 'Recompenses' }">
        <img src="/icons/gift.svg" alt="" aria-hidden="true" />
        <span>Récompenses</span>
      </router-link>

      <router-link :class="{ active: isActive('Parametres') }" :to="{ name: 'Parametres' }">
        <img src="/icons/cog.svg" alt="" aria-hidden="true" />
        <span>Paramètres</span>
      </router-link>
    </template>

    <template v-else>
      <button class="nav-button auth-action" type="button" @click="$emit('open-login')">
        <img src="/icons/log-in.svg" alt="" aria-hidden="true" />
        <span>Connexion</span>
      </button>

      <button class="nav-button auth-action register-action" type="button" @click="$emit('open-register')">
        <img src="/icons/user-round-plus.svg" alt="" aria-hidden="true" />
        <span>Inscription</span>
      </button>
    </template>
  </nav>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'MobileBottomNav',
  emits: ['open-login', 'open-register'],
  computed: {
    ...mapGetters(['isLoggedIn'])
  },
  methods: {
    isActive(routeName) {
      return this.$route.name === routeName;
    }
  }
};
</script>

<style scoped>
.mobile-bottom-nav {
  position: fixed;
  inset: auto 0 0;
  z-index: 1100;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.15rem;
  width: 100%;
  padding: 0.45rem 0.45rem calc(0.45rem + env(safe-area-inset-bottom));
  border-radius: 0.75rem 0.75rem 0 0;
  background: var(--color-pangeas-primary);
  box-shadow: 0 -10px 28px rgba(68, 42, 34, 0.2);
}

.mobile-bottom-nav.guest {
  grid-template-columns: 0.95fr 1fr 1.15fr;
}

.mobile-bottom-nav a,
.nav-button {
  display: grid;
  justify-items: center;
  align-content: center;
  gap: 0.2rem;
  min-width: 0;
  min-height: 3.4rem;
  padding: 0.4rem 0.15rem;
  border-radius: 999px;
  color: var(--color-pangeas-surface-strong);
  font-size: clamp(0.66rem, 2.8vw, 0.78rem);
  font-weight: 900;
  text-decoration: none;
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.mobile-bottom-nav img,
.nav-button img {
  width: 1.25rem;
  height: 1.25rem;
  opacity: 0.9;
  filter: brightness(0) invert(1);
}

.mobile-bottom-nav .active {
  background: var(--color-pangeas-bg);
  color: var(--color-pangeas-primary);
}

.mobile-bottom-nav .active img,
.register-action img {
  filter: brightness(0) saturate(100%) invert(16%) sepia(26%) saturate(832%) hue-rotate(333deg) brightness(96%) contrast(92%);
  opacity: 1;
}

.mobile-bottom-nav a:hover,
.nav-button:hover {
  transform: translateY(-1px);
  text-decoration: none;
}

.auth-action {
  background: rgba(253, 249, 244, 0.12);
}

.register-action {
  background: var(--color-pangeas-bg);
  color: var(--color-pangeas-primary);
}

@media (min-width: 768px) {
  .mobile-bottom-nav {
    display: none;
  }
}
</style>
