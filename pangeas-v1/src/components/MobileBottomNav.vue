<template>
  <nav class="mobile-bottom-nav" aria-label="Navigation mobile">
    <router-link :class="{ active: isActive('Home') }" :to="{ name: 'Home' }">
      <img src="/icons/map.svg" alt="" aria-hidden="true" />
      <span>Explorer</span>
    </router-link>
    <router-link :class="{ active: isActive('MonCompte') }" :to="{ name: 'MonCompte' }">
      <img src="/icons/heart.svg" alt="" aria-hidden="true" />
      <span>Favoris</span>
    </router-link>
    <router-link :class="{ active: false }" :to="{ name: 'MonCompte' }">
      <img src="/icons/route.svg" alt="" aria-hidden="true" />
      <span>Récompenses</span>
    </router-link>
    <router-link :class="{ active: isActive('Parametres') }" :to="{ name: 'Parametres' }">
      <img src="/icons/cog.svg" alt="" aria-hidden="true" />
      <span>Paramètres</span>
    </router-link>
  </nav>
</template>

<script>
export default {
  name: 'MobileBottomNav',
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
  background: #f1ede8;
  box-shadow: 0 -8px 26px rgba(68, 42, 34, 0.08);
}

.mobile-bottom-nav a {
  display: grid;
  justify-items: center;
  align-content: center;
  gap: 0.2rem;
  min-width: 0;
  min-height: 3.4rem;
  padding: 0.4rem 0.15rem;
  border-radius: 999px;
  color: #665852;
  font-size: clamp(0.66rem, 2.8vw, 0.78rem);
  font-weight: 900;
  text-decoration: none;
}

.mobile-bottom-nav img {
  width: 1.25rem;
  height: 1.25rem;
  opacity: 0.78;
}

.mobile-bottom-nav .active {
  background: #5d4037;
  color: #e7bdb1;
}

.mobile-bottom-nav .active img {
  filter: brightness(0) saturate(100%) invert(83%) sepia(14%) saturate(628%) hue-rotate(323deg) brightness(92%) contrast(97%);
  opacity: 1;
}

@media (min-width: 768px) {
  .mobile-bottom-nav {
    display: none;
  }
}
</style>
