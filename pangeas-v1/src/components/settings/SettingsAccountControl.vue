<template>
  <section class="settings-card shadow">
    <h2 class="section-title">Gestion du compte</h2>

    <div class="info-line">
      <div class="info-text">
        <strong>Suppression du compte</strong>
      </div>
      <span class="delete-link" @click="showDeleteModal = true">Supprimer</span>
    </div>

    <div class="info-line">
      <div class="info-text">
        <strong>Suppression des données</strong>
      </div>
      <span class="delete-link" @click="showDeleteDataModal = true">Supprimer</span>
    </div>

    <div class="info-line">
      <div class="info-text">
        <strong>Export des données (format JSON)</strong>
      </div>
      <span class="download-link" @click="downloadJson">Télécharger</span>
    </div>

    <DeleteAccountModal v-if="showDeleteModal" @close="showDeleteModal = false" />
    <DeleteUserDataModal v-if="showDeleteDataModal" @close="showDeleteDataModal = false" />
  </section>
</template>


<script>
import { mapState } from 'vuex';
import axios from 'axios';
import DeleteAccountModal from '../modal/DeleteAccountModal.vue';
import DeleteUserDataModal from '../modal/DeleteUserDataModal.vue';



export default {
  components: {
    DeleteAccountModal,
    DeleteUserDataModal
  },
  data() {
    return {
      showDeleteModal: false,
      showDeleteDataModal: false,
      geolocationEnabled: false
    };
  },
  computed: {
    ...mapState({
      user: state => state.user
    })
  },
  methods: {
    async downloadJson() {
      try {
        const res = await axios.get('/api/settings/export', {
          responseType: 'blob',
          withCredentials: true
        });
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'mes_donnees_pangeas.json');
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (err) {
        console.error("Erreur export JSON :", err);
        alert("Erreur lors de l'export.");
      }
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

.download-link,
.delete-link {
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s ease, color 0.2s ease;
  white-space: nowrap;
}

.download-link {
  color: var(--color-blue);
}

.delete-link {
  color: #BB2D3B;
}

.download-link:hover,
.delete-link:hover {
  transform: scale(1.05);
}

/* Responsive pour mobile */
@media (max-width: 600px) {
  .settings-card {
    padding: 1.5rem;
  }

  .info-line {
    flex-direction: column;
    align-items: flex-start;
  }

  .delete-link,
  .download-link {
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

