<template>
  <section class="settings-card shadow">
    <h2 class="section-title">Informations de profil</h2>

    <div class="info-line">
      <div class="info-text">
        <strong>Pseudo :</strong>
        <span>{{ user?.pseudo }}</span>
      </div>
      <router-link to="/mon-compte" class="edit-link" style="text-decoration: none">modifier</router-link>
    </div>

    <div class="info-line">
      <div class="info-text">
        <strong>Adresse mail :</strong>
        <span>{{ user?.email }}</span>
      </div>
      <span class="edit-link" @click="openEmailModal">modifier</span>
    </div>

    <div class="info-line">
      <div class="info-text">
        <strong>Mot de passe :</strong>
        <span>********</span>
      </div>
      <span class="edit-link" @click="openPasswordModal">modifier</span>
    </div>

    <div class="info-line">
      <div class="info-text">
        <strong>Se déconnecter</strong>
      </div>
      <span class="logout-link" @click="$emit('logout')">Déconnexion</span>
    </div>

    <EmailUpdateModal v-if="showEmailModal" @close="showEmailModal = false" />
    <PasswordUpdateModal v-if="showPasswordModal" @close="showPasswordModal = false" />
  </section>
</template>


<script>
import { mapState } from 'vuex';
import EmailUpdateModal from '../modal/EmailUpdateModal.vue';
import PasswordUpdateModal from '../modal/PasswordUpdateModal.vue';

export default {
  components: {
    EmailUpdateModal,
    PasswordUpdateModal
  },
  data() {
    return {
      showEmailModal: false,
      showPasswordModal: false
    };
  },
  computed: {
    ...mapState({
      user: state => state.user
    })
  },
  methods: {
    openEmailModal() {
      this.showEmailModal = true;
    },
    openPasswordModal() {
      this.showPasswordModal = true;
    }
  }
};
</script>

<style scoped>
.settings-card {
  background-color: var(--color-beige);
  border: 4px solid var(--color-brown);
  color: var(--color-brown);
  border-radius: 8px;
  padding: 2rem;
  margin: 4rem 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.section-title {
  color: var(--color-brown);
  font-size: 1.6rem;
  margin-bottom: 2rem;
}

.info-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
  gap: 0.5rem;
}

.info-text {
  flex: 1 1 70%;
  display: flex;
  flex-direction: column;
  font-size: 1rem;
}

.edit-link,
.logout-link {
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s ease, color 0.2s ease;
  color: #007bff;
  white-space: nowrap;
}

.logout-link {
  color: #BB2D3B;
}

.edit-link:hover,
.logout-link:hover {
  transform: scale(1.05);
}

@media (max-width: 600px) {
  .settings-card {
    padding: 1.5rem;
  }

  .info-line {
    flex-direction: column;
    align-items: flex-start;
  }

  .edit-link,
  .logout-link {
    align-self: flex-end;
    margin-top: 0.5rem;
  }

  .info-text {
    width: 100%;
  }

  .section-title {
    font-size: 1.4rem;
    text-align: center;
  }
}
</style>

