<template>
  <header class="submission-topbar">
    <button class="submission-back" type="button" aria-label="Retour" @click="goBack">
      <img src="/icons/arrow-left.svg" alt="" aria-hidden="true" />
    </button>
    <router-link class="submission-brand" :to="{ name: 'Home' }" aria-label="Retour à la carte">
      <picture>
        <source media="(min-width: 768px)" srcset="/logo_marron_2.png" />
        <img src="/logo_mobile_pangeas.png" alt="PANGEAS" />
      </picture>
      <span>{{ title }}</span>
    </router-link>
    <router-link class="submission-account-link" :to="{ name: 'MonCompte' }">Mon compte</router-link>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router';

defineProps({ title: { type: String, required: true } });
const router = useRouter();

function goBack() {
  if (window.history.length > 1) router.back();
  else router.push({ name: 'Home' });
}
</script>

<style scoped>
.submission-topbar {
  position: fixed;
  inset: 0 0 auto;
  z-index: 1100;
  display: flex;
  align-items: center;
  min-height: 6.75rem;
  padding: 0.8rem 1.25rem;
  border-bottom: 1px solid rgba(212, 195, 190, 0.55);
  background: rgba(253, 249, 244, 0.94);
  backdrop-filter: blur(14px);
}

.submission-back {
  display: grid;
  place-items: center;
  width: 2.55rem;
  height: 2.55rem;
  border-radius: 999px;
}

.submission-back:hover { background: rgba(68, 42, 34, 0.07); }
.submission-back img { width: 1.25rem; }

.submission-brand {
  position: absolute;
  left: 50%;
  display: grid;
  justify-items: center;
  color: var(--color-pangeas-primary);
  font-family: var(--font-title);
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.1;
  text-decoration: none;
  transform: translateX(-50%);
}

.submission-brand:hover { text-decoration: none; }
.submission-brand img { width: 5.7rem; opacity: 0.7; }
.submission-account-link { display: none; margin-left: auto; color: var(--color-pangeas-primary); font-size: 0.85rem; font-weight: 900; }

@media (min-width: 768px) {
  .submission-topbar { padding-inline: 4rem; }
  .submission-brand img { width: 9.5rem; opacity: 0.9; }
  .submission-account-link { display: block; }
}
</style>
