<template>
  <div>
    <h1 class="h3 mb-3 text-gray-800">Ajouter un lieu</h1>
    <p class="mb-4">Remplissez le formulaire pour ajouter un nouveau lieu à Pangeas.</p>

    <div class="card shadow-sm">
      <div class="card-body">
        <form @submit.prevent="createPlace">

          <div class="mb-3">
            <label class="form-label">Nom</label>
            <input type="text" v-model="form.name" class="form-control" required>
          </div>

          <div class="mb-3">
            <label class="form-label">Département</label>
            <input type="text" v-model="form.department" class="form-control" required>
          </div>

          <div class="mb-3">
            <label class="form-label">Région</label>
            <input type="text" v-model="form.region" class="form-control" required>
          </div>

          <div class="mb-3">
            <label class="form-label">Catégorie</label>
            <input type="text" v-model="form.category" class="form-control" required>
          </div>

          <div class="mb-3">
            <label class="form-label">Description</label>
            <textarea v-model="form.description" class="form-control" required></textarea>
          </div>

          <div class="mb-3">
            <label class="form-label">Légende</label>
            <input type="text" v-model="form.legend" class="form-control" required>
          </div>

          <div class="mb-3">
            <label class="form-label">Anecdote</label>
            <input type="text" v-model="form.anecdote" class="form-control" required>
          </div>

          <div class="mb-3">
            <label class="form-label">Activités (séparées par des virgules)</label>
            <input type="text" v-model="activitiesInput" class="form-control" required>
          </div>

          <div class="mb-3">
            <label class="form-label">Image URL</label>
            <input type="url" v-model="form.image_url" class="form-control" required>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Latitude</label>
              <input type="number" step="any" v-model="form.coordinates.lat" class="form-control" required>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Longitude</label>
              <input type="number" step="any" v-model="form.coordinates.lng" class="form-control" required>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">Distance (km)</label>
            <input type="number" step="0.1" v-model="form.distance_km" class="form-control" required>
          </div>

          <div class="d-flex justify-content-between">
            <button type="button" class="btn btn-secondary" @click="$router.push('/admin/places')">
              Annuler
            </button>
            <button type="submit" class="btn btn-primary">
              Enregistrer
            </button>
          </div>

        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "@/axios";

export default {
  name: "AddPlaceAdmin",
  inject: {
    refreshPublicPlaces: { default: null },
  },
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
        coordinates: { lat: "", lng: "" },
        distance_km: ""
      },
      activitiesInput: ""
    };
  },
  methods: {
    async createPlace() {
      this.form.activities = this.activitiesInput.split(",").map(a => a.trim());

      try {
        await axios.post("/api/admin/places", this.form, { withCredentials: true });
        if (this.refreshPublicPlaces) {
          await this.refreshPublicPlaces({ invalidateCache: true });
        }
        this.$router.push("/admin/places");
      } catch (err) {
        console.error("Erreur lors de l'ajout :", err);
        alert(err.response?.data?.error || "Erreur lors de l'ajout du lieu");
      }
    }
  }
};
</script>
