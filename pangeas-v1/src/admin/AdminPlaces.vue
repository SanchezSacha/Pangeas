<template>
  <div>
    <h1 class="h3 mb-2 text-gray-800">Lieux</h1>
    <p class="mb-4">Liste complète des lieux enregistrés dans Pangeas.</p>

    <button class="btn btn-success btn-sm mb-4" @click="$router.push('/admin/places/add')">
      <i class="fas fa-plus"></i> Ajouter un lieu
    </button>

    <div class="card shadow-sm">
      <div class="card-header bg-primary text-white fw-bold">
        Tableau des lieux
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
            <tr>
              <th>Nom</th>
              <th>Type</th>
              <th>Département</th>
              <th>Date d'ajout</th>
              <th class="text-center">Actions</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="place in places" :key="place._id">
              <td>{{ place.name }}</td>
              <td>{{ place.category }}</td>
              <td>{{ place.department }}</td>
              <td>{{ formatDate(place.created_at) }}</td>
              <td class="text-center">
                <button class="btn btn-info btn-sm me-2" @click="$router.push(`/admin/places/${place._id}`)">
                  <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-warning btn-sm me-2" @click="$router.push(`/admin/places/${place._id}/edit`)">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" @click="openDeleteModal(place)">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
            <tr v-if="places.length === 0">
              <td colspan="5" class="text-center text-muted">Aucun lieu trouvé.</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "@/axios";
import Swal from "sweetalert2";

export default {
  name: "AdminPlaces",
  data() {
    return {
      places: [],
    };
  },
  mounted() {
    this.fetchPlaces();
  },
  methods: {
    async fetchPlaces() {
      try {
        const res = await axios.get("/api/admin/places", { withCredentials: true });
        this.places = res.data;
      } catch (error) {
        console.error("Erreur lors du chargement des lieux :", error);
      }
    },
    formatDate(date) {
      return date
          ? new Date(date).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })
          : "-";
    },
    async openDeleteModal(place) {
      const result = await Swal.fire({
        title: `Supprimer le lieu ?`,
        html: `Voulez-vous vraiment supprimer <strong>${place.name}</strong> ?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Oui, supprimer",
        cancelButtonText: "Annuler",
        confirmButtonColor: "#d33",
        cancelButtonColor: "#0000FF",
      });

      if (result.isConfirmed) {
        try {
          await axios.delete(`/api/admin/places/${place._id}`, { withCredentials: true });
          await this.fetchPlaces();
          await Swal.fire("Supprimé !", "Le lieu a bien été supprimé.", "success");
        } catch (error) {
          console.error("Erreur suppression lieu :", error);
          await Swal.fire("Erreur", "Impossible de supprimer le lieu.", "error");
        }
      }
    },
  },
};
</script>

<style scoped>
.card-header {
  font-size: 1.2rem;
}
.table-hover tbody tr:hover {
  background-color: #f8f9fa;
}
.btn i {
  pointer-events: none;
}
.table-responsive {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  width: 100%;
}
</style>
