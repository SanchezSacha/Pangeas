<template>
  <div class="history-page">
    <SubmissionPageHeader title="Mes propositions" />
    <main class="history-main">
      <div class="history-heading">
        <div><p class="eyebrow">Suivi des contributions</p><h1>Mes propositions de lieux</h1><p>Retrouvez l’avancement de vos demandes et les retours de l’équipe.</p></div>
        <router-link class="primary-action new-button" :to="{ name: 'ProposerLieu' }"><span>+</span> Proposer un lieu</router-link>
      </div>

      <div v-if="$route.query.sent" class="success-banner" role="status"><span>✓</span><p><strong>Proposition bien envoyée !</strong><br />Vous serez informé dès qu’elle aura été examinée.</p></div>

      <div class="status-filters" aria-label="Filtrer les propositions">
        <button v-for="filter in filters" :key="filter.value" type="button" :class="{ active: activeFilter === filter.value }" @click="activeFilter = filter.value">
          {{ filter.label }} <span>{{ countFor(filter.value) }}</span>
        </button>
      </div>

      <div v-if="loading" class="history-state">Chargement de vos propositions…</div>
      <div v-else-if="loadError" class="history-state error"><p>{{ loadError }}</p><button type="button" @click="fetchSubmissions">Réessayer</button></div>
      <div v-else-if="filteredSubmissions.length === 0" class="history-state empty">
        <span aria-hidden="true">⌖</span><h2>Aucune proposition ici</h2><p>{{ submissions.length ? 'Essayez un autre filtre.' : 'Partagez le prochain lieu qui mérite d’être découvert.' }}</p>
        <router-link v-if="!submissions.length" :to="{ name: 'ProposerLieu' }">Faire ma première proposition</router-link>
      </div>

      <div v-else class="submission-list">
        <article v-for="submission in filteredSubmissions" :key="submission.id" :class="['submission-card', { expanded: isOpen(submission.id) }]">
          <button class="submission-overview" type="button" :aria-expanded="isOpen(submission.id)" @click="toggle(submission.id)">
            <img v-if="submission.photos?.[0]" :src="submission.photos[0].thumbnailUrl" alt="" />
            <div v-else class="image-placeholder">⌖</div>
            <div class="submission-title">
              <span :class="['status-badge', submission.status]">{{ statusInfo(submission.status).label }}</span>
              <h2>{{ submission.title }}</h2>
              <p>Envoyée le {{ formatDate(submission.createdAt) }} · {{ categoryLabel(submission.category) }}</p>
            </div>
            <img class="chevron" src="/icons/chevron-right.svg" alt="" aria-hidden="true" />
          </button>

          <div v-if="isOpen(submission.id)" class="submission-detail">
            <div :class="['status-message', submission.status]">
              <span aria-hidden="true">{{ statusInfo(submission.status).icon }}</span>
              <div><strong>{{ statusInfo(submission.status).title }}</strong><p>{{ submission.statusMessage }}</p></div>
            </div>
            <div class="detail-grid">
              <div><span>Catégorie</span><strong>{{ categoryLabel(submission.category) }}</strong></div>
              <div><span>Dernière mise à jour</span><strong>{{ formatDate(submission.updatedAt) }}</strong></div>
              <div><span>Position</span><strong>{{ formatCoordinates(submission.coordinates) }}</strong></div>
            </div>
            <p v-if="submission.description" class="description"><span>Description</span>{{ submission.description }}</p>
            <div v-if="submission.photos?.length" class="detail-photos">
              <img v-for="photo in submission.photos" :key="photo.id" :src="photo.thumbnailUrl" alt="Photo de la proposition" />
            </div>
            <router-link v-if="submission.status === 'needs_changes'" class="primary-action edit-button" :to="{ name: 'ModifierProposition', params: { id: submission.id } }">
              <img src="/icons/pen.svg" alt="" aria-hidden="true" /> Compléter ma proposition
            </router-link>
          </div>
        </article>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import axios from '@/axios.js';
import SubmissionPageHeader from './SubmissionPageHeader.vue';

const route = useRoute();
const submissions = ref([]);
const loading = ref(true);
const loadError = ref('');
const activeFilter = ref('all');
const openId = ref(route.query.open ? Number(route.query.open) : null);
const filters = [
  { value: 'all', label: 'Toutes' }, { value: 'pending', label: 'En cours' },
  { value: 'needs_changes', label: 'À compléter' }, { value: 'approved', label: 'Publiées' },
  { value: 'closed', label: 'Terminées' },
];
const statusMap = {
  pending: { label: 'En vérification', title: 'Votre proposition est en cours d’examen', icon: '◷' },
  needs_changes: { label: 'À compléter', title: 'Une action est attendue', icon: '!' },
  approved: { label: 'Publié', title: 'Votre lieu est publié', icon: '✓' },
  rejected: { label: 'Refusé', title: 'Cette proposition n’a pas été retenue', icon: '×' },
  cancelled: { label: 'Annulé', title: 'Vous avez annulé cette proposition', icon: '–' },
};
const categoryMap = { nature: 'Nature', historique: 'Historique', urbain: 'Urbain', frisson: 'Frisson', secret: 'Secret' };
const filteredSubmissions = computed(() => {
  if (activeFilter.value === 'all') return submissions.value;
  if (activeFilter.value === 'closed') return submissions.value.filter(item => ['rejected', 'cancelled'].includes(item.status));
  return submissions.value.filter(item => item.status === activeFilter.value);
});

function statusInfo(status) { return statusMap[status] || { label: status, title: 'Statut mis à jour', icon: '•' }; }
function categoryLabel(category) { return categoryMap[category] || category; }
function formatDate(value) { return new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }); }
function formatCoordinates(coords) { return Number.isFinite(Number(coords?.lat)) ? `${Number(coords.lat).toFixed(4)}, ${Number(coords.lng).toFixed(4)}` : 'Non renseignée'; }
function isOpen(id) { return openId.value === id; }
function toggle(id) { openId.value = isOpen(id) ? null : id; }
function countFor(filter) {
  if (filter === 'all') return submissions.value.length;
  if (filter === 'closed') return submissions.value.filter(item => ['rejected', 'cancelled'].includes(item.status)).length;
  return submissions.value.filter(item => item.status === filter).length;
}
async function fetchSubmissions() {
  loading.value = true; loadError.value = '';
  try {
    const response = await axios.get('/api/place-submissions/me?limit=50');
    submissions.value = response.data.submissions || [];
  } catch (error) {
    loadError.value = error.response?.data?.message || 'Impossible de charger vos propositions.';
  } finally { loading.value = false; }
}
onMounted(fetchSubmissions);
</script>

<style scoped>
.history-page { min-height: 100vh; background: var(--color-pangeas-bg); color: var(--color-auth-text); }
.history-main { width: min(100%, 68rem); margin: 0 auto; padding: 8.25rem 1rem 7rem; }
.history-heading { display: flex; flex-direction: column; align-items: flex-start; gap: 1.25rem; margin-bottom: 1.5rem; }
.eyebrow { margin-bottom: 0.45rem; color: #8a6d62; font-size: 0.68rem; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; }
.history-heading h1 { color: var(--color-pangeas-primary); font-size: clamp(1.65rem, 5vw, 2.45rem); }
.history-heading p:last-child { margin-top: 0.45rem; color: var(--color-pangeas-muted); }
.new-button, .edit-button { display: inline-flex; align-items: center; justify-content: center; gap: 0.45rem; border-radius: 999px; background: var(--color-pangeas-primary); color: white; font-weight: 900; text-decoration: none; }
.new-button { min-height: 3rem; padding: 0.7rem 1rem; }
.new-button span { font-size: 1.4rem; font-weight: 500; }
.success-banner { display: flex; gap: 0.75rem; margin-bottom: 1rem; padding: 0.9rem 1rem; border: 1px solid #c9ddcf; border-radius: 0.85rem; background: #edf6f0; color: #395744; font-size: 0.82rem; }
.success-banner > span { display: grid; place-items: center; width: 1.8rem; height: 1.8rem; flex: 0 0 auto; border-radius: 50%; background: #c8ead8; }
.status-filters { display: flex; gap: 0.45rem; margin-bottom: 1rem; overflow-x: auto; padding-bottom: 0.25rem; scrollbar-width: none; }
.status-filters button { display: flex; align-items: center; gap: 0.4rem; min-height: 2.4rem; padding: 0.45rem 0.7rem; border: 1px solid var(--color-pangeas-line); border-radius: 999px; background: var(--color-pangeas-bg); color: var(--color-pangeas-muted); font-size: 0.76rem; font-weight: 900; white-space: nowrap; }
.status-filters button.active { border-color: var(--color-pangeas-primary); background: var(--color-pangeas-primary); color: white; }
.status-filters button span { display: grid; place-items: center; min-width: 1.25rem; height: 1.25rem; padding: 0 0.25rem; border-radius: 999px; background: rgba(128, 99, 88, 0.12); font-size: 0.65rem; }
.submission-list { display: grid; gap: 0.75rem; }
.submission-card { overflow: hidden; border: 1px solid rgba(205, 184, 176, 0.85); border-radius: 0.9rem; background: rgba(247, 243, 238, 0.9); box-shadow: var(--shadow-pangeas-card); }
.submission-card.expanded { border-color: #a98e84; }
.submission-overview { display: grid; grid-template-columns: 4.75rem minmax(0, 1fr) auto; align-items: center; gap: 0.8rem; width: 100%; padding: 0.75rem; text-align: left; }
.submission-overview > img:first-child, .image-placeholder { width: 4.75rem; height: 4.75rem; border-radius: 0.65rem; object-fit: cover; }
.image-placeholder { display: grid; place-items: center; background: #e7ddd7; color: var(--color-pangeas-muted); font-size: 1.5rem; }
.submission-title { min-width: 0; }
.submission-title h2 { overflow: hidden; margin: 0.3rem 0 0.15rem; color: var(--color-pangeas-primary); font-size: 1rem; text-overflow: ellipsis; white-space: nowrap; }
.submission-title p { color: var(--color-pangeas-muted); font-size: 0.69rem; }
.status-badge { display: inline-flex; padding: 0.25rem 0.45rem; border-radius: 999px; background: #f3e4cc; color: #76531e; font-size: 0.62rem; font-weight: 900; }
.status-badge.needs_changes { background: #f8ded6; color: #8b3728; }
.status-badge.approved { background: #ddefe3; color: #316548; }
.status-badge.rejected, .status-badge.cancelled { background: #e8e4e1; color: #645d58; }
.chevron { width: 1.05rem; transition: transform 0.2s ease; }
.expanded .chevron { transform: rotate(90deg); }
.submission-detail { display: grid; gap: 0.85rem; padding: 0 0.85rem 0.9rem; border-top: 1px solid rgba(212, 195, 190, 0.6); }
.status-message { display: flex; gap: 0.65rem; margin-top: 0.85rem; padding: 0.75rem; border-radius: 0.7rem; background: #f7ead7; color: #6f4e20; font-size: 0.78rem; }
.status-message > span { display: grid; place-items: center; width: 1.65rem; height: 1.65rem; flex: 0 0 auto; border-radius: 50%; background: rgba(255,255,255,.65); font-weight: 900; }
.status-message.needs_changes { background: #f8ded6; color: #7e3427; }
.status-message.approved { background: #ddefe3; color: #315f45; }
.status-message.rejected, .status-message.cancelled { background: #e8e4e1; color: #5e5753; }
.status-message p { margin-top: 0.15rem; line-height: 1.4; }
.detail-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
.detail-grid > div { display: grid; gap: 0.15rem; padding: 0.65rem; border-radius: 0.6rem; background: var(--color-pangeas-bg); }
.detail-grid span, .description span { color: #8a6d62; font-size: 0.62rem; font-weight: 900; letter-spacing: 0.06em; text-transform: uppercase; }
.detail-grid strong { color: var(--color-pangeas-primary); font-size: 0.76rem; }
.description { display: grid; gap: 0.25rem; color: var(--color-pangeas-muted); font-size: 0.8rem; line-height: 1.5; }
.detail-photos { display: flex; gap: 0.45rem; overflow-x: auto; }
.detail-photos img { width: 5rem; height: 5rem; flex: 0 0 auto; border-radius: 0.55rem; object-fit: cover; }
.edit-button { justify-self: start; min-height: 2.8rem; padding: 0.6rem 0.9rem; font-size: 0.8rem; }
.edit-button img { width: 0.9rem; filter: brightness(0) invert(1); }
.history-state { display: grid; justify-items: center; gap: 0.55rem; padding: 3rem 1rem; border: 1px dashed var(--color-pangeas-line); border-radius: 0.9rem; color: var(--color-pangeas-muted); text-align: center; }
.history-state > span { font-size: 2rem; }.history-state h2 { font-size: 1.2rem; }.history-state a, .history-state button { color: var(--color-pangeas-primary); font-weight: 900; text-decoration: underline; }.history-state.error { color: var(--color-pangeas-danger); }

@media (min-width: 768px) {
  .history-main { padding: 9rem 3rem 4rem; }
  .history-heading { flex-direction: row; align-items: end; justify-content: space-between; }
  .submission-overview { grid-template-columns: 6rem minmax(0, 1fr) auto; padding: 0.9rem; }
  .submission-overview > img:first-child, .image-placeholder { width: 6rem; height: 5rem; }
  .submission-title h2 { font-size: 1.15rem; }
  .submission-detail { padding: 0 1rem 1rem 7.9rem; }
  .detail-grid { grid-template-columns: repeat(3, 1fr); }
}
</style>
