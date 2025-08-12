<template>
  <div>
    <h1 class="h3 mb-2 text-gray-800">Détail du lieu</h1>
    <p class="mb-4">Informations complètes sur le lieu sélectionné.</p>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else class="card shadow-sm">
      <div class="card-header bg-primary text-white fw-bold">
        Détails du lieu : {{ place.name }}
      </div>
      <div class="card-body">
        <dl class="row">

          <dt class="col-sm-3">Nom</dt>
          <dd class="col-sm-9">{{ place.name }}</dd>

          <dt class="col-sm-3">Illustration</dt>
          <dd class="col-sm-9 d-flex align-items-center">
            <img
                v-if="place.image_url"
                :src="place.image_url"
                :alt="place.name"
                style="max-width: 200px; height: auto; border-radius: 6px; box-shadow: 0 0 8px rgba(0,0,0,0.15);"
            />
            <span v-else>-</span>
          </dd>

          <dt class="col-sm-3">Type / Catégorie</dt>
          <dd class="col-sm-9">{{ place.category }}</dd>

          <dt class="col-sm-3">Département</dt>
          <dd class="col-sm-9">{{ place.department }}</dd>

          <dt class="col-sm-3">Région</dt>
          <dd class="col-sm-9">{{ place.region || '-' }}</dd>

          <dt class="col-sm-3">Description</dt>
          <dd class="col-sm-9" v-html="place.description || '-'"></dd>

          <dt class="col-sm-3">Légende</dt>
          <dd class="col-sm-9">{{ place.legend || '-' }}</dd>

          <dt class="col-sm-3">Anecdote</dt>
          <dd class="col-sm-9">{{ place.anecdote || '-' }}</dd>

          <dt class="col-sm-3">Activités</dt>
          <dd class="col-sm-9">{{ place.activities || '-' }}</dd>

          <dt class="col-sm-3">Latitude</dt>
          <dd class="col-sm-9">{{ place.coordinates.lat || '-' }}</dd>

          <dt class="col-sm-3">Longitude</dt>
          <dd class="col-sm-9">{{ place.coordinates.lng || '-' }}</dd>

          <dt class="col-sm-3">Date d'ajout</dt>
          <dd class="col-sm-9">{{ formatDate(place.created_at) }}</dd>

        </dl>

        <div class="mt-4">
          <button class="btn btn-secondary me-2" @click="$router.push('/admin/places')">Retour</button>
          <button class="btn btn-warning" @click="$router.push(`/admin/places/${place._id}/edit`)">
            Modifier ce lieu
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "@/axios";

export default {
  name: "AdminPlaceDetails",
  data() {
    return {
      place: null,
      loading: true,
      error: null,
    };
  },
  mounted() {
    this.fetchPlace();
  },
  methods: {
    async fetchPlace() {
      this.loading = true;
      this.error = null;
      const id = this.$route.params.id;

      try {
        const res = await axios.get(`/api/admin/places/${id}`, { withCredentials: true });
        this.place = res.data;
      } catch (err) {
        if (err.response?.status === 404) {
          this.error = "Lieu non trouvé.";
        } else if (err.response?.status === 400) {
          this.error = "ID invalide.";
        } else {
          this.error = "Erreur lors de la récupération du lieu.";
        }
      } finally {
        this.loading = false;
      }
    },
    formatDate(date) {
      if (!date) return "-";
      return new Date(date).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    },
  },
};
</script>

<style scoped>
dt {
  font-weight: 600;
}
dd {
  margin-bottom: 1rem;
}
</style>
