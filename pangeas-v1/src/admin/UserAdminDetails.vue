<template>
  <div class="container py-5" style="background-color: var(--color-white)">
    <div class="card shadow-sm rounded">
      <div class="card-header bg-primary text-white">
        <h4 class="mb-0">Détails de l'utilisateur</h4>
      </div>
      <div class="card-body">

        <div class="d-flex align-items-center mb-5" v-if="user">
          <div class="avatar-wrapper rounded-circle me-4">
            <img
                :src="computedAvatar"
                :key="computedAvatar"
                @error="onAvatar"
                alt="Avatar"
                class="avatar-image rounded-circle"
            />
          </div>
          <div>
            <h3 class="mb-1 fw-bold text-dark">{{ user.pseudo }}</h3>
            <p class="mb-1 text-muted fs-6">{{ user.email }}</p>
            <div>
              <span class="badge rounded-pill px-3 py-1 me-2"
                    :class="user.is_active ? 'bg-success' : 'bg-secondary'">
                {{ user.is_active ? 'Actif' : 'Inactif' }}
              </span>
              <span class="badge bg-info rounded-pill px-3 py-1">
                {{ user.role }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="user.bio" class="mb-5 p-4 bg-light rounded border">
          <h5 class="mb-3 text-secondary fw-semibold">Bio</h5>
          <p class="mb-0 fs-6">{{ user.bio }}</p>
        </div>

        <div class="row g-4 mb-5 text-center">
          <div class="col-md-3">
            <div class="card shadow-sm p-4 rounded border">
              <h6 class="text-muted mb-2">Lieux visités</h6>
              <h2 class="fw-bold text-primary">{{ user.visited_places.length }}</h2>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card shadow-sm p-4 rounded border">
              <h6 class="text-muted mb-2">Favoris</h6>
              <h2 class="fw-bold text-primary">{{ user.favorites_count }}</h2>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card shadow-sm p-4 rounded border">
              <h6 class="text-muted mb-2">Inscription</h6>
              <h2 class="text-primary">{{ formatDate(user.created_at) }}</h2>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card shadow-sm p-4 rounded border">
              <h6 class="text-muted mb-2">Dernière modif.</h6>
              <h2 class="text-primary">{{ formatDate(user.updated_at) }}</h2>
            </div>
          </div>
        </div>

        <div v-if="user.settings" class="mb-5 p-4 bg-light rounded border">
          <h5 class="mb-3 text-secondary fw-semibold">Paramètres</h5>
          <pre class="fs-7 text-dark" style="white-space: pre-wrap;">{{ user.settings }}</pre>
        </div>

        <button class="btn btn-outline-secondary d-flex align-items-center" @click="$router.back()">
          <i class="fas fa-arrow-left me-2"></i> Retour
        </button>

      </div>
    </div>
  </div>
</template>

<script>
import axios from "@/axios";
import { resolveAvatarUrl } from "@/utils/avatar";

export default {
  name: "UserDetails",
  data() {
    return {
      user: {
        avatar_url: "/img-avatar.jpg",
        pseudo: "",
        email: "",
        is_active: false,
        role: "",
        visited_places: [],
        favorites_count: 0,
        created_at: null,
        updated_at: null,
        settings: null,
        bio: ""
      },
      loading: true
    };
  },
  computed: {
    computedAvatar() {
      return this.user && this.user.avatar_url ? this.user.avatar_url : "/img-avatar.jpg";
    }
  },
  async created() {
    const id = this.$route.params.id;
    try {
      const res = await axios.get(`/api/admin/users/${id}`, { withCredentials: true });
      this.user = {
        ...res.data,
        avatar_url: resolveAvatarUrl(res.data.avatar_url, "/img-avatar.jpg")
      };
    } catch (err) {
      console.error("Erreur récupération détails user :", err);
    } finally {
      this.loading = false;
    }
  },
  methods: {
    formatDate(date) {
      return date ? new Date(date).toLocaleDateString("fr-FR") : "-";
    },
    onAvatar(e) {
      e.target.onerror = null;
      e.target.src = "/img-avatar.jpg";
      if (this.user) this.user.avatar_url = "/img-avatar.jpg";
    }
  },
};
</script>


<style scoped>
.avatar-wrapper {
  width: 100px;
  height: 100px;
  overflow: hidden;
  border: 3px solid var(--bs-primary);
  flex-shrink: 0;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

h3 {
  font-size: 1.8rem;
}
h5 {
  font-size: 1.25rem;
}
.fs-6 {
  font-size: 1rem;
}
.fs-7 {
  font-size: 0.85rem;
}
.card {
  border-color: #e3e6f0;
  background-color: #fff;
}

.badge {
  font-weight: 600;
  font-size: 0.85rem;
}

.btn-outline-secondary {
  font-weight: 600;
  font-size: 1rem;
  padding: 0.5rem 1.25rem;
  border-radius: 0.35rem;
  transition: background-color 0.2s ease;
}

.btn-outline-secondary:hover {
  background-color: #e2e6ea;
}
</style>
