<template>
  <section class="submission-summary">
    <router-link class="summary-heading" :to="{ name: 'MesPropositions' }">
      <span class="heading-icon"><i class="fa-solid fa-location-dot"></i></span>
      <div>
        <p>Vos contributions</p>
        <h2>Propositions de lieux</h2>
      </div>
      <img src="/icons/chevron-right.svg" alt="" aria-hidden="true" />
    </router-link>

    <div v-if="loading" class="summary-state">Chargement…</div>
    <div v-else-if="error" class="summary-state error">Impossible de charger vos propositions.</div>
    <div v-else class="summary-content">
      <div class="summary-counts">
        <div><strong>{{ total }}</strong><span>au total</span></div>
        <div><strong>{{ actionCount }}</strong><span>à compléter</span></div>
        <div><strong>{{ approvedCount }}</strong><span>publiée{{ approvedCount > 1 ? 's' : '' }}</span></div>
      </div>
      <router-link v-if="latest" class="latest-submission" :to="{ name: 'MesPropositions', query: { open: latest.id } }">
        <div>
          <span :class="['status-dot', latest.status]"></span>
          <p><strong>{{ latest.title }}</strong><small>{{ statusLabel(latest.status) }} · {{ formatDate(latest.updatedAt) }}</small></p>
        </div>
        <img src="/icons/chevron-right.svg" alt="" aria-hidden="true" />
      </router-link>
      <p v-else class="summary-state">Vous n’avez pas encore proposé de lieu.</p>
      <router-link class="summary-cta" :to="{ name: 'ProposerLieu' }">+ Proposer un lieu</router-link>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import axios from '@/axios.js';

const submissions = ref([]);
const total = ref(0);
const loading = ref(true);
const error = ref(false);
const latest = computed(() => submissions.value[0]);
const actionCount = computed(() => submissions.value.filter(item => item.status === 'needs_changes').length);
const approvedCount = computed(() => submissions.value.filter(item => item.status === 'approved').length);

const labels = { pending: 'En vérification', needs_changes: 'À compléter', approved: 'Publié', rejected: 'Refusé', cancelled: 'Annulé' };
const statusLabel = status => labels[status] || status;
const formatDate = value => new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

onMounted(async () => {
  try {
    const response = await axios.get('/api/place-submissions/me?limit=50');
    submissions.value = response.data.submissions || [];
    total.value = response.data.total || submissions.value.length;
  } catch {
    error.value = true;
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.submission-summary { width: 100%; min-width: 0; padding: 1.25rem; border: 1px solid rgba(205, 184, 176, 0.85); border-radius: 0.9rem; background: rgba(247, 243, 238, 0.88); box-shadow: var(--shadow-pangeas-card); }
.summary-heading { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 0.75rem; color: inherit; text-decoration: none; }
.summary-heading:hover { text-decoration: none; }
.heading-icon { display: grid; place-items: center; width: 2.65rem; height: 2.65rem; border-radius: 0.75rem; background: #eee1c9; color: var(--color-pangeas-primary-soft); }
.summary-heading p { color: #8a6d62; font-size: 0.65rem; font-weight: 900; letter-spacing: 0.09em; text-transform: uppercase; }
.summary-heading h2 { color: var(--color-pangeas-primary); font-size: 1.35rem; }
.summary-heading > img { width: 1.2rem; transition: transform 0.2s ease; }
.summary-heading:hover > img { transform: translateX(3px); }
.summary-content { display: grid; gap: 0.9rem; margin-top: 1.15rem; }
.summary-counts { display: grid; grid-template-columns: repeat(3, 1fr); overflow: hidden; border: 1px solid var(--color-pangeas-line); border-radius: 0.7rem; background: var(--color-pangeas-bg); }
.summary-counts > div { display: grid; justify-items: center; padding: 0.7rem 0.25rem; text-align: center; }
.summary-counts > div + div { border-left: 1px solid var(--color-pangeas-line); }
.summary-counts strong { color: var(--color-pangeas-primary); font-size: 1.25rem; }
.summary-counts span { color: var(--color-pangeas-muted); font-size: 0.68rem; font-weight: 800; }
.latest-submission { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; padding: 0.8rem; border-radius: 0.7rem; background: var(--color-pangeas-card-tint); color: inherit; text-decoration: none; }
.latest-submission > div { display: flex; align-items: center; gap: 0.65rem; min-width: 0; }
.latest-submission p { display: grid; min-width: 0; }
.latest-submission strong { overflow: hidden; color: var(--color-pangeas-primary); font-size: 0.86rem; text-overflow: ellipsis; white-space: nowrap; }
.latest-submission small { color: var(--color-pangeas-muted); font-size: 0.7rem; }
.latest-submission > img { width: 1rem; }
.status-dot { width: 0.65rem; height: 0.65rem; flex: 0 0 auto; border-radius: 50%; background: #b78245; }
.status-dot.needs_changes { background: #c45f47; }
.status-dot.approved { background: #43835e; }
.status-dot.rejected, .status-dot.cancelled { background: #8b8580; }
.summary-cta { justify-self: start; color: var(--color-pangeas-primary); font-size: 0.82rem; font-weight: 900; text-decoration: underline; text-underline-offset: 3px; }
.summary-state { padding: 1rem 0; color: var(--color-pangeas-muted); font-size: 0.82rem; }
.summary-state.error { color: var(--color-pangeas-danger); }
</style>
