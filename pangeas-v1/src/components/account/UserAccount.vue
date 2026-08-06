<template>
  <div class="mon-compte-page">
    <header class="profile-topbar">
      <button class="topbar-back" type="button" aria-label="Retour" @click="goBack">
        <img src="/icons/arrow-left.svg" alt="" aria-hidden="true" />
      </button>

      <div class="topbar-title">
        <picture>
          <source media="(min-width: 768px)" srcset="/logo_marron_2.png" />
          <img src="/logo_mobile_pangeas.png" alt="PANGEAS" class="profile-logo" />
        </picture>
        <h1>Profil</h1>
      </div>

      <nav class="desktop-nav" aria-label="Navigation principale">
        <router-link :to="{ name: 'Home' }">Explorer</router-link>
        <router-link class="active" :to="{ name: 'MonCompte' }">Favoris</router-link>
        <router-link :to="{ name: 'Recompenses' }">Récompenses</router-link>
        <router-link :to="{ name: 'Parametres' }">Paramètres</router-link>
      </nav>
    </header>

    <section class="profil-section">
      <EditAccount v-if="user" :user="user" @updateUser="handleUserUpdate" />
      <FavoriteCarousel />
      <StatsUser />
      <HistoricPlaces />
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import EditAccount from '../account/EditAccount.vue';
import FavoriteCarousel from "./FavoriteCarousel.vue";
import StatsUser from "./StatsUser.vue";
import HistoricPlaces from "./HistoricPlaces.vue";
import axios from "@/axios.js";

const user = ref(null);
const router = useRouter();

async function fetchUser() {
  try {
    const response = await axios.get('/api/auth/me', {withCredentials: true});
    if (response.data.success) {
      user.value = response.data.user;
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur :", error);
  }
}
function handleUserUpdate(updatedUser) {
  user.value = updatedUser;
}

function goBack() {
  router.back();
}

onMounted(fetchUser);
</script>

<style scoped>
.mon-compte-page {
  background: var(--color-pangeas-bg);
  min-height: 100vh;
  padding: 8.25rem 1rem 6rem;
  color: #1c1c19;
}

.profile-topbar {
  position: fixed;
  inset: 0 0 auto;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 1rem;
  min-height: 7rem;
  padding: 0.9rem 1.25rem;
  border-bottom: 1px solid rgba(212, 195, 190, 0.45);
  background: rgba(253, 249, 244, 0.92);
  backdrop-filter: blur(14px);
}

.desktop-nav {
  display: none;
  margin-left: auto;
  gap: 1.6rem;
}

.desktop-nav a {
  color: var(--color-pangeas-muted);
  font-weight: 800;
  font-size: 0.84rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-decoration: none;
}

.desktop-nav a.active {
  color: var(--color-pangeas-primary);
  border-bottom: 2px solid var(--color-pangeas-primary);
}

.topbar-back {
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  flex: 0 0 auto;
  border-radius: 999px;
  transition: background 0.2s ease, transform 0.2s ease;
}

.topbar-back:hover {
  background: rgba(68, 42, 34, 0.07);
}

.topbar-back:active {
  transform: scale(0.96);
}

.topbar-back img {
  width: 1.25rem;
  height: 1.25rem;
}

.topbar-title {
  position: absolute;
  left: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
  text-align: center;
  transform: translateX(-50%);
}

.profile-logo {
  width: 5.7rem;
  height: auto;
  opacity: 0.62;
}

.topbar-title h1 {
  margin-top: -0.25rem;
  color: var(--color-pangeas-primary);
  font-size: 1.1rem;
  line-height: 1.2;
}

.profil-section {
  width: min(100%, 68rem);
  margin: 0 auto;
}

@media (min-width: 768px) {
  .mon-compte-page {
    padding: 8.75rem 4rem 4rem;
  }

  .profile-topbar {
    padding-inline: 4rem;
  }

  .desktop-nav {
    display: flex;
  }

  .profile-logo {
    width: 10.25rem;
    opacity: 0.86;
  }

  .topbar-title h1 {
    margin-top: 0.15rem;
  }
}
</style>
