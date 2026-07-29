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
import axios from "@/axios.js";

const user = ref(null);

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

onMounted(fetchUser);
</script>

<style scoped>
.mon-compte-page {
  background: #fdf9f4;
  min-height: 100vh;
  padding: 1rem 1rem 6rem;
  color: #1c1c19;
}

.profil-section {
  width: min(100%, 68rem);
  margin: 0 auto;
}

@media (min-width: 768px) {
  .mon-compte-page {
    padding-left: calc(90px + 2rem);
    padding-right: 2rem;
  }
}
</style>
