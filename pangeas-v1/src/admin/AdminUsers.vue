<template>
  <h1 class="h3 mb-2 text-gray-800">Utilisateurs</h1>
  <p class="mb-4">Liste complète des utilisateurs inscrits sur Pangeas.</p>

  <div class="card shadow-sm">
    <div class="card-header bg-primary text-white fw-bold">
      Tableau des utilisateurs
    </div>
    <div class="card-body p-0">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
          <tr>
            <th>Pseudo</th>
            <th>Email</th>
            <th>Date de création</th>
            <th>Date de modification</th>
            <th>Nb Lieux visités</th>
            <th class="text-center">Actions</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.pseudo }}</td>
            <td>{{ user.email }}</td>
            <td>{{ formatDate(user.created_at) }}</td>
            <td>{{ formatDate(user.updated_at) }}</td>
            <td class="text-center fw-bold">{{ user.visited_places_count }}</td>
            <td class="text-center">
              <button class="btn btn-info btn-sm me-2" @click="$router.push(`/admin/users/${user.id}`)">
                <i class="fas fa-eye"></i>
              </button>
              <button class="btn btn-warning btn-sm me-2" @click="$router.push(`/admin/users/${user.id}/edit`)">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-danger btn-sm" @click="openDeleteModal(user)">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "@/axios";
import Swal from "sweetalert2";

export default {
  name: "AdminUsers",
  data() {
    return {
      users: [],
    };
  },
  mounted() {
    this.fetchUsers();
  },
  methods: {
    async fetchUsers() {
      try {
        const res = await axios.get("/api/admin/users", { withCredentials: true });
        this.users = res.data;
      } catch (error) {
        console.error("Erreur lors du chargement des utilisateurs :", error);
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
    async openDeleteModal(user) {
      const result = await Swal.fire({
        title: `Supprimer l'utilisateur ?`,
        html: `Voulez-vous vraiment supprimer <strong>${user.pseudo}</strong> et toutes ses données ?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Oui, supprimer",
        cancelButtonText: "Annuler",
        confirmButtonColor: "#d33",
        cancelButtonColor: "#0000FF",
      });

      if (result.isConfirmed) {
        try {
          await axios.delete(`/api/admin/users/${user.id}`, {withCredentials: true});
          await this.fetchUsers();
          await Swal.fire("Supprimé !", "L'utilisateur a bien été supprimé.", "success");
        } catch (error) {
          console.error("Erreur suppression utilisateur :", error);
          await Swal.fire("Erreur", "Impossible de supprimer l'utilisateur.", "error");
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
