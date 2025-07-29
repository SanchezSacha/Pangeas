<template>
  <div class="mon-compte-page">
    <Sidebar />

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
import EditAccount from '../account/EditAccount.vue';
import Sidebar from "../Sidebar.vue";
import FavoriteCarousel from "./FavoriteCarousel.vue";
import StatsUser from "./StatsUser.vue";
import HistoricPlaces from "./HistoricPlaces.vue";

const user = ref(null);

async function fetchUser() {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    const data = await res.json();
    if (data.success) {
      user.value = data.user;
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur :", error);
  }
}

function handleUserUpdate(updatedUser) {
  user.value = updatedUser;
}

onMounted(fetchUser);
</script>

<style scoped>
.mon-compte-page {
  background-color: var(--color-beige);
  min-height: 100vh;
  padding: 1rem;
}
</style>
