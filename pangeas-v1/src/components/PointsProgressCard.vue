<template>
  <section class="points-progress" aria-labelledby="points-progress-title">
    <div class="points-progress-heading">
      <span class="points-icon" aria-hidden="true">
        <img src="/icons/badge-check.svg" alt="" />
      </span>
      <div>
        <small id="points-progress-title">Solde disponible</small>
        <strong v-if="!isLoading">{{ formatNumber(availablePoints) }} <em>pts</em></strong>
        <span v-else class="points-loading"></span>
      </div>
      <router-link :to="{ name: 'Recompenses' }">Voir les récompenses</router-link>
    </div>

    <template v-if="!isLoading">
      <div class="progress-copy">
        <span>{{ progressLabel }}</span>
        <b v-if="nextReward">{{ formatNumber(nextReward.pointsCost) }} pts</b>
      </div>
      <div
        class="progress-track"
        role="progressbar"
        :aria-valuenow="progressPercent"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-label="progressLabel"
      >
        <i :style="{ width: `${progressPercent}%` }"></i>
      </div>
      <p v-if="nextReward">
        Encore <strong>{{ formatNumber(pointsRemaining) }} points</strong> pour « {{ nextReward.name }} »
      </p>
      <p v-else-if="rewardCatalog.length" class="reward-ready">
        Vous pouvez déjà choisir parmi les récompenses disponibles.
      </p>
      <p v-else>Le prochain objectif apparaîtra dès qu’une récompense sera disponible.</p>
      <button v-if="loadError" class="retry-button" type="button" @click="loadProgress">Réessayer</button>
    </template>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import axios from '@/axios.js';

const props = defineProps({
  external: Boolean,
  pointsSummary: { type: Object, default: null },
  rewards: { type: Array, default: null },
  loading: Boolean,
});

const localSummary = ref(null);
const localRewards = ref([]);
const localLoading = ref(true);
const loadError = ref(false);

const summary = computed(() => props.external ? props.pointsSummary : localSummary.value);
const rewardCatalog = computed(() => props.external ? (props.rewards || []) : localRewards.value);
const isLoading = computed(() => props.external ? props.loading : localLoading.value);
const availablePoints = computed(() => Number(summary.value?.availablePoints) || 0);
const availableRewards = computed(() => rewardCatalog.value.filter(reward => Number(reward?._count?.couponCodes) > 0));
const nextReward = computed(() => [...availableRewards.value]
  .filter(reward => Number(reward.pointsCost) > availablePoints.value)
  .sort((a, b) => Number(a.pointsCost) - Number(b.pointsCost))[0] || null);
const pointsRemaining = computed(() => nextReward.value
  ? Math.max(0, Number(nextReward.value.pointsCost) - availablePoints.value)
  : 0);
const progressPercent = computed(() => {
  if (!nextReward.value) return availableRewards.value.length ? 100 : 0;
  return Math.min(100, Math.round((availablePoints.value / Number(nextReward.value.pointsCost)) * 100));
});
const progressLabel = computed(() => {
  if (nextReward.value) return 'Prochaine récompense';
  return availableRewards.value.length ? 'Récompense accessible' : 'Prochain objectif';
});

function formatNumber(value) {
  return new Intl.NumberFormat('fr-FR').format(Number(value) || 0);
}

async function loadProgress() {
  if (props.external) return;
  localLoading.value = true;
  loadError.value = false;
  const [summaryRequest, rewardsRequest] = await Promise.allSettled([
    axios.get('/api/points/summary'),
    axios.get('/api/rewards'),
  ]);

  if (summaryRequest.status === 'fulfilled') localSummary.value = summaryRequest.value.data.summary;
  if (rewardsRequest.status === 'fulfilled') localRewards.value = rewardsRequest.value.data.rewards || [];
  loadError.value = summaryRequest.status === 'rejected' || rewardsRequest.status === 'rejected';
  localLoading.value = false;
}

onMounted(loadProgress);
</script>

<style scoped>
.points-progress {
  width: min(100%, 36rem);
  max-width: 100%;
  min-width: 0;
  margin: 1.35rem auto 0;
  padding: 1.05rem;
  border: 1px solid #b99d91;
  border-radius: 0.9rem;
  background: linear-gradient(145deg, #efe0d6, #f7eee8);
  box-shadow: 0 10px 26px rgba(68, 42, 34, 0.1);
  text-align: left;
}

.points-progress-heading {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) minmax(0, auto);
  align-items: center;
  gap: 0.75rem;
}

.points-icon {
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.75rem;
  background: var(--color-pangeas-primary);
}

.points-icon img {
  width: 1.25rem;
  filter: brightness(0) invert(1);
}

.points-progress-heading > div {
  display: grid;
  min-width: 0;
}

.points-progress-heading small {
  color: var(--color-pangeas-muted);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.points-progress-heading strong {
  color: var(--color-pangeas-primary);
  font-family: var(--font-title);
  font-size: 1.45rem;
  line-height: 1.15;
}

.points-progress-heading em {
  font-family: var(--font-content);
  font-size: 0.72rem;
  font-style: normal;
}

.points-progress-heading a {
  max-width: 8.5rem;
  color: var(--color-pangeas-primary);
  font-size: 0.72rem;
  font-weight: 900;
  text-align: right;
  text-decoration: underline;
  text-underline-offset: 0.2rem;
}

.progress-copy {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1rem;
  color: #65544d;
  font-size: 0.75rem;
  font-weight: 800;
}

.progress-track {
  height: 0.5rem;
  margin-top: 0.4rem;
  overflow: hidden;
  border-radius: 999px;
  background: #d9cbc4;
}

.progress-track i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #789b86, #4f7962);
  transition: width 0.5s ease;
}

.points-progress > p {
  margin-top: 0.55rem;
  color: #65544d;
  font-size: 0.75rem;
  line-height: 1.4;
  text-align: left;
}

.points-progress > p strong,
.points-progress .reward-ready {
  color: #315b47;
  font-weight: 900;
}

.points-loading {
  width: 5.5rem;
  height: 1.4rem;
  margin-top: 0.2rem;
  border-radius: 0.35rem;
  background: #d9cbc4;
  animation: points-pulse 1.2s infinite;
}

.retry-button {
  margin-top: 0.55rem;
  color: #934b3c;
  font-size: 0.72rem;
  font-weight: 900;
  text-decoration: underline;
}

@keyframes points-pulse {
  50% { opacity: 0.45; }
}

@media (max-width: 380px) {
  .points-progress-heading {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .points-progress-heading a {
    grid-column: 1 / -1;
    max-width: none;
    text-align: left;
  }
}
</style>
