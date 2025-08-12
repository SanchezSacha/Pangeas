<template>
  <div>
    <h1 class="h3 mb-2 text-gray-800">Modifier le lieu</h1>
    <p class="mb-4">Éditez les informations du lieu.</p>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Chargement...</span></div>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <form v-else @submit.prevent="submitForm" class="card shadow-sm p-4">

      <div class="mb-3">
        <label for="name" class="form-label fw-bold">Nom *</label>
        <input type="text" id="name" v-model="form.name" class="form-control" required />
      </div>

      <div class="mb-3">
        <label for="category" class="form-label fw-bold">Type / Catégorie *</label>
        <input type="text" id="category" v-model="form.category" class="form-control" required />
      </div>

      <div class="mb-3">
        <label for="department" class="form-label fw-bold">Département *</label>
        <input type="text" id="department" v-model="form.department" class="form-control" required />
      </div>

      <div class="mb-3">
        <label for="region" class="form-label fw-bold">Région *</label>
        <input type="text" id="region" v-model="form.region" class="form-control" required />
      </div>

      <div class="mb-3">
        <label for="image_url" class="form-label fw-bold">URL de l'image *</label>
        <input type="url" id="image_url" v-model="form.image_url" class="form-control" required />
        <div v-if="form.image_url" class="mt-2">
          <img :src="form.image_url" alt="Aperçu de l'image" style="max-width: 200px; border-radius: 6px;" />
        </div>
      </div>

      <div class="mb-3">
        <label for="description" class="form-label fw-bold">Description *</label>
        <textarea id="description" v-model="form.description" rows="4" class="form-control" required></textarea>
      </div>

      <div class="mb-3">
        <label for="legend" class="form-label fw-bold">Légende *</label>
        <input type="text" id="legend" v-model="form.legend" class="form-control" required />
      </div>

      <div class="mb-3">
        <label for="anecdote" class="form-label fw-bold">Anecdote *</label>
        <input type="text" id="anecdote" v-model="form.anecdote" class="form-control" required />
      </div>

      <div class="mb-3">
        <label for="activities" class="form-label fw-bold">Activités *</label>
        <input
            type="text"
            id="activities"
            v-model="activitiesInput"
            class="form-control"
            placeholder="Ex : randonnée, vélo, escalade"
            required
        />
      </div>

      <div class="mb-3">
        <label for="coordinates_lat" class="form-label fw-bold">Latitude *</label>
        <input type="number" id="coordinates_lat" v-model.number="form.coordinates.lat" step="any" class="form-control" required />
      </div>

      <div class="mb-3">
        <label for="coordinates_lng" class="form-label fw-bold">Longitude *</label>
        <input type="number" id="coordinates_lng" v-model.number="form.coordinates.lng" step="any" class="form-control" required />
      </div>

      <div class="mb-3">
        <label for="distance_km" class="form-label fw-bold">Distance (km) *</label>
        <input type="number" id="distance_km" v-model.number="form.distance_km" step="0.01" min="0" class="form-control" required />
      </div>

      <div class="d-flex mt-4" style="gap: 2rem">
        <button type="button" class="btn btn-secondary" @click="$router.back()">Annuler</button>
        <button type="submit" class="btn btn-primary" :disabled="submitting">
          {{ submitting ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
      </div>

    </form>
  </div>
</template>

<script>
import axios from "@/axios";
import Swal from "sweetalert2";

export default {
  name: "AdminPlaceEdit",
  data() {
    return {
      form: {
        name: "",
        department: "",
        region: "",
        category: "",
        description: "",
        legend: "",
        anecdote: "",
        activities: [],
        image_url: "",
        coordinates: {
          lat: null,
          lng: null,
        },
        distance_km: null,
      },
      activitiesInput: "",
      loading: true,
      submitting: false,
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
        const place = res.data;

        this.form = {
          name: place.name || "",
          department: place.department || "",
          region: place.region || "",
          category: place.category || "",
          description: place.description || "",
          legend: place.legend || "",
          anecdote: place.anecdote || "",
          activities: Array.isArray(place.activities) ? place.activities : [],
          image_url: place.image_url || "",
          coordinates: place.coordinates || { lat: null, lng: null },
          distance_km: place.distance_km || null,
        };

        this.activitiesInput = this.form.activities.join(", ");
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
    async submitForm() {
      this.form.activities = this.activitiesInput
          .split(",")
          .map((a) => a.trim())
          .filter((a) => a.length > 0);

      this.submitting = true;

      try {
        const id = this.$route.params.id;
        await axios.put(`/api/admin/places/${id}`, this.form, { withCredentials: true });

        await Swal.fire("Succès", "Lieu mis à jour avec succès.", "success");
        this.$router.push(`/admin/places/${id}`);
      } catch (error) {
        console.error(error);
        await Swal.fire("Erreur", "Une erreur est survenue lors de la mise à jour.", "error");
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>

<style scoped>
</style>
