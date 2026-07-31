<template>
  <aside
      v-if="isVisible"
      class="offline-status"
      :class="{
        'offline-status-warning': !isOnline,
        'offline-status-place-detail': isPlaceDetail
      }"
      role="status"
      aria-live="polite"
  >
    <i :class="statusIcon" aria-hidden="true"></i>
    <div>
      <strong>{{ statusTitle }}</strong>
      <small>{{ statusDescription }}</small>
    </div>
    <button
        v-if="isOnline && pendingCount > 0"
        type="button"
        :disabled="isSyncing"
        @click="synchronize"
    >
      {{ isSyncing ? 'Synchronisation…' : 'Synchroniser' }}
    </button>
  </aside>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import { syncPendingActions } from '@/services/offlineService';

const store = useStore();
const route = useRoute();
const syncFeedback = ref(null);
let feedbackTimer = null;

const isOnline = computed(() => store.state.isOnline);
const isSyncing = computed(() => store.state.isSyncing);
const pendingCount = computed(() => store.state.pendingSyncCount);
const usingOfflineData = computed(() => store.state.usingOfflineData);
const lastSyncAt = computed(() => store.state.lastPlacesSyncAt);
const isPlaceDetail = computed(() => route.name === 'PlaceDetail');

const isVisible = computed(() => (
    !isOnline.value || isSyncing.value || pendingCount.value > 0 || usingOfflineData.value || syncFeedback.value
));

const statusIcon = computed(() => {
  if (!isOnline.value) return 'fa-solid fa-cloud-arrow-down';
  if (isSyncing.value) return 'fa-solid fa-rotate fa-spin';
  if (syncFeedback.value) return 'fa-solid fa-circle-check';
  if (pendingCount.value > 0) return 'fa-solid fa-cloud-arrow-up';
  return 'fa-solid fa-database';
});

const statusTitle = computed(() => {
  if (!isOnline.value) return 'Mode hors connexion';
  if (isSyncing.value) return 'Synchronisation en cours';
  if (syncFeedback.value) return 'Synchronisation terminée';
  if (pendingCount.value > 0) {
    return `${pendingCount.value} action${pendingCount.value > 1 ? 's' : ''} en attente`;
  }
  return 'Données enregistrées sur cet appareil';
});

const formatLastSync = timestamp => {
  if (!timestamp) return 'Aucune synchronisation récente.';
  return `Dernière mise à jour : ${new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(timestamp))}.`;
};

const statusDescription = computed(() => {
  if (!isOnline.value) {
    const pendingMessage = pendingCount.value > 0
        ? ` ${pendingCount.value} action${pendingCount.value > 1 ? 's seront envoyées' : ' sera envoyée'} au retour du réseau.`
        : '';
    return `${formatLastSync(lastSyncAt.value)}${pendingMessage}`;
  }

  if (isSyncing.value) return 'Pangeas envoie les actions enregistrées localement.';
  if (syncFeedback.value) {
    const { synced, remaining } = syncFeedback.value;
    if (remaining > 0) {
      return `${synced} action${synced > 1 ? 's envoyées' : ' envoyée'}, ${remaining} encore en attente.`;
    }
    return `${synced} action${synced > 1 ? 's ont été synchronisées' : ' a été synchronisée'}. Tout est à jour.`;
  }
  if (pendingCount.value > 0) return 'La connexion est revenue, les changements peuvent être envoyés.';
  return formatLastSync(lastSyncAt.value);
});

const synchronize = () => syncPendingActions();

const handleSyncComplete = event => {
  syncFeedback.value = event.detail;
  if (feedbackTimer) clearTimeout(feedbackTimer);
  feedbackTimer = setTimeout(() => {
    syncFeedback.value = null;
    feedbackTimer = null;
  }, 4500);
};

onMounted(() => window.addEventListener('pangeas:sync-complete', handleSyncComplete));
onBeforeUnmount(() => {
  window.removeEventListener('pangeas:sync-complete', handleSyncComplete);
  if (feedbackTimer) clearTimeout(feedbackTimer);
});
</script>

<style scoped>
.offline-status {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  z-index: 1600;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.75rem;
  width: min(31rem, calc(100vw - 2rem));
  padding: 0.8rem 0.9rem;
  border: 1px solid rgba(93, 64, 55, 0.25);
  border-radius: 0.8rem;
  background: rgba(253, 249, 244, 0.96);
  color: var(--color-pangeas-primary);
  box-shadow: 0 14px 36px rgba(68, 42, 34, 0.18);
  backdrop-filter: blur(12px);
}

.offline-status-warning {
  border-color: rgba(164, 105, 42, 0.42);
}

.offline-status > i {
  font-size: 1.15rem;
}

.offline-status div {
  display: grid;
  gap: 0.15rem;
}

.offline-status strong,
.offline-status small {
  line-height: 1.25;
}

.offline-status small {
  color: var(--color-pangeas-muted);
  font-size: 0.75rem;
}

.offline-status button {
  min-height: 2.35rem;
  padding: 0.45rem 0.75rem;
  border: 0;
  border-radius: 999px;
  background: var(--color-pangeas-primary);
  color: var(--color-pangeas-bg);
  font-weight: 800;
}

.offline-status button:disabled {
  cursor: wait;
  opacity: 0.65;
}

@media (max-width: 767px) {
  .offline-status {
    right: 0.75rem;
    bottom: calc(5rem + env(safe-area-inset-bottom));
    width: calc(100vw - 1.5rem);
  }

  .offline-status-place-detail {
    top: calc(5.1rem + env(safe-area-inset-top));
    bottom: auto;
  }

  .offline-status button {
    grid-column: 2 / 4;
    justify-self: start;
  }
}
</style>
