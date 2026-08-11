<template>
  <div class="admin-submissions">
    <div class="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
      <div><h1 class="h3 mb-1 text-gray-800">Propositions de lieux</h1><p class="mb-0">Vérifiez et modérez les lieux envoyés par la communauté.</p></div>
      <div class="pending-count"><i class="fas fa-clock"></i><strong>{{ pendingCount }}</strong><span>à examiner</span></div>
    </div>

    <div class="card shadow-sm mb-4">
      <div class="card-body filters-row">
        <div class="input-group search-box"><span class="input-group-text"><i class="fas fa-search"></i></span><input v-model.trim="query" class="form-control" type="search" placeholder="Lieu ou utilisateur" @keyup.enter="applyFilters" /></div>
        <select v-model="status" class="form-select" aria-label="Filtrer par statut" @change="applyFilters">
          <option value="">Tous les statuts</option><option value="pending">En attente</option><option value="needs_changes">À compléter</option><option value="approved">Publiées</option><option value="rejected">Refusées</option><option value="cancelled">Annulées</option>
        </select>
        <button class="btn btn-primary" type="button" @click="applyFilters">Filtrer</button>
      </div>
    </div>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>
    <div class="card shadow-sm">
      <div class="card-header bg-primary text-white fw-bold d-flex justify-content-between"><span>Demandes reçues</span><span>{{ total }} résultat{{ total > 1 ? 's' : '' }}</span></div>
      <div class="card-body p-0">
        <div v-if="loading" class="text-center py-5"><div class="spinner-border text-primary" role="status"></div></div>
        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light"><tr><th>Lieu</th><th>Contributeur</th><th>Catégorie</th><th>Reçue le</th><th>Statut</th><th class="text-center">Action</th></tr></thead>
            <tbody>
              <tr v-for="submission in submissions" :key="submission.id">
                <td><div class="place-cell"><img v-if="submission.photos?.[0]" :src="submission.photos[0].thumbnailUrl" alt="" /><span v-else class="photo-fallback"><i class="fas fa-map-marker-alt"></i></span><strong>{{ submission.title }}</strong></div></td>
                <td>{{ submission.user?.pseudo || 'Utilisateur' }}</td><td class="text-capitalize">{{ submission.category }}</td><td>{{ formatDate(submission.createdAt) }}</td>
                <td><span :class="['submission-status', submission.status]">{{ statusLabel(submission.status) }}</span></td>
                <td class="text-center"><router-link class="btn btn-info btn-sm" :to="{ name: 'AdminPlaceSubmissionDetails', params: { id: submission.id } }" aria-label="Examiner"><i class="fas fa-eye"></i></router-link></td>
              </tr>
              <tr v-if="submissions.length === 0"><td colspan="6" class="text-center text-muted py-5">Aucune proposition pour ces critères.</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-if="totalPages > 1" class="card-footer d-flex justify-content-between align-items-center"><button class="btn btn-outline-secondary btn-sm" :disabled="page === 1" @click="changePage(page - 1)">Précédent</button><span>Page {{ page }} / {{ totalPages }}</span><button class="btn btn-outline-secondary btn-sm" :disabled="page === totalPages" @click="changePage(page + 1)">Suivant</button></div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import axios from '@/axios.js';
const submissions = ref([]); const loading = ref(true); const error = ref(''); const query = ref(''); const status = ref('pending'); const page = ref(1); const total = ref(0); const totalPages = ref(1);
const pendingCount = computed(() => status.value === 'pending' ? total.value : submissions.value.filter(item => item.status === 'pending').length);
const labels = { pending: 'En attente', needs_changes: 'À compléter', approved: 'Publiée', rejected: 'Refusée', cancelled: 'Annulée' };
const statusLabel = value => labels[value] || value;
const formatDate = value => new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
async function fetchSubmissions() { loading.value = true; error.value = ''; try { const response = await axios.get('/api/admin/place-submissions', { params: { page: page.value, limit: 20, status: status.value || undefined, q: query.value || undefined } }); submissions.value = response.data.submissions || []; total.value = response.data.total || 0; totalPages.value = response.data.totalPages || 1; } catch (err) { error.value = err.response?.data?.message || 'Impossible de charger les propositions.'; } finally { loading.value = false; } }
function applyFilters() { page.value = 1; fetchSubmissions(); }
function changePage(nextPage) { page.value = nextPage; fetchSubmissions(); }
onMounted(fetchSubmissions);
</script>

<style scoped>
.filters-row { display: grid; grid-template-columns: minmax(14rem, 1fr) minmax(10rem, .45fr) auto; gap: .75rem; }.pending-count { display: grid; grid-template-columns: auto auto; align-items: center; column-gap: .55rem; padding: .7rem 1rem; border-radius: .6rem; background: #fff4df; color: #76531e; }.pending-count i { grid-row: 1 / 3; font-size: 1.25rem; }.pending-count strong { line-height: 1; }.pending-count span { font-size: .7rem; }.place-cell { display: flex; align-items: center; gap: .65rem; min-width: 12rem; }.place-cell img,.photo-fallback { width: 2.8rem; height: 2.8rem; flex: 0 0 auto; border-radius: .45rem; object-fit: cover; }.photo-fallback { display: grid; place-items: center; background: #eee6e1; color: #765548; }.submission-status { display: inline-flex; padding: .3rem .55rem; border-radius: 999px; background: #fff0d6; color: #79551c; font-size: .72rem; font-weight: 800; white-space: nowrap; }.submission-status.needs_changes { background:#f8ded6;color:#8b3728 }.submission-status.approved { background:#ddefe3;color:#316548 }.submission-status.rejected,.submission-status.cancelled { background:#e8e4e1;color:#645d58 }
@media(max-width:767px){.filters-row{grid-template-columns:1fr}.admin-submissions{min-width:0}.card-header{font-size:.86rem}}
</style>
