<template>
  <div class="submission-page">
    <SubmissionPageHeader :title="isEditing ? 'Compléter la demande' : 'Proposer un lieu'" />

    <main class="submission-main">
      <section class="submission-intro">
        <p class="eyebrow">Contribution à la communauté</p>
        <h1>{{ isEditing ? 'Complétez votre proposition' : 'Partagez un lieu remarquable' }}</h1>
        <p>Quelques informations suffisent. L’équipe Pangeas vérifiera votre proposition avant sa publication.</p>
        <div class="reward-note">
          <span aria-hidden="true">✦</span>
          <p><strong>Une contribution récompensée</strong><br />Vous recevrez des points si le lieu est publié.</p>
        </div>
      </section>

      <form class="submission-form" novalidate @submit.prevent="submitForm">
        <div v-if="loading" class="state-card">Chargement de votre proposition…</div>

        <template v-else>
          <section class="form-card">
            <div class="card-heading"><span>1</span><div><h2>Le lieu</h2><p>Donnez-nous l’essentiel.</p></div></div>

            <label class="field">
              <span>Nom du lieu <b>*</b></span>
              <input v-model.trim="form.title" type="text" maxlength="120" autocomplete="off" placeholder="Ex. Le belvédère des Roches" :aria-invalid="Boolean(errors.title)" />
              <small v-if="errors.title" class="field-error">{{ errors.title }}</small>
            </label>

            <fieldset class="field category-field">
              <legend>Catégorie <b>*</b></legend>
              <div class="category-grid">
                <label v-for="category in categories" :key="category.value" :class="{ selected: form.category === category.value }">
                  <input v-model="form.category" type="radio" name="category" :value="category.value" />
                  <span class="category-icon" aria-hidden="true" v-html="category.icon"></span>
                  <span>{{ category.label }}</span>
                </label>
              </div>
              <small v-if="errors.category" class="field-error">{{ errors.category }}</small>
            </fieldset>

            <label class="field">
              <span>Description <em>facultative</em></span>
              <textarea v-model.trim="form.description" maxlength="500" rows="5" placeholder="Qu’est-ce qui rend ce lieu intéressant ? Ajoutez un conseil d’accès si utile."></textarea>
              <small class="character-count">{{ form.description.length }}/500</small>
            </label>
          </section>

          <section class="form-card">
            <div class="card-heading"><span>2</span><div><h2>La position</h2><p>Placez le repère le plus précisément possible.</p></div></div>

            <div class="location-actions">
              <button type="button" :disabled="locating" @click="useMyLocation">
                <span aria-hidden="true" v-html="locationIcon"></span>
                {{ locating ? 'Localisation…' : 'Utiliser ma position' }}
              </button>
              <p>ou touchez directement la carte</p>
            </div>

            <div ref="pickerMapElement" class="location-map" aria-label="Carte permettant de choisir la position du lieu"></div>
            <div v-if="hasCoordinates" class="location-confirmation">
              <span aria-hidden="true">✓</span>
              <p><strong>Position enregistrée</strong><br />{{ formattedCoordinates }}</p>
            </div>
            <small v-if="locationMessage" :class="['location-message', { error: errors.coordinates }]">{{ locationMessage }}</small>
          </section>

          <section class="form-card">
            <div class="card-heading"><span>3</span><div><h2>Les photos</h2><p>Ajoutez 1 à 5 photos nettes du lieu.</p></div></div>

            <label class="photo-dropzone" :class="{ 'has-error': errors.photos }">
              <input ref="photoInput" type="file" accept="image/jpeg,image/png,image/webp" multiple @change="handlePhotos" />
              <img src="/icons/upload.svg" alt="" aria-hidden="true" />
              <strong>Choisir des photos</strong>
              <span>JPEG, PNG ou WebP · 2 Mo maximum par photo</span>
            </label>
            <small v-if="isEditing && existingPhotos.length && !photos.length" class="existing-note">Les photos actuelles seront conservées si vous n’en choisissez pas de nouvelles.</small>
            <small v-if="errors.photos" class="field-error">{{ errors.photos }}</small>

            <div v-if="displayedPhotos.length" class="photo-grid">
              <div v-for="photo in displayedPhotos" :key="photo.key" class="photo-preview">
                <img :src="photo.url" :alt="photo.alt" />
                <button v-if="!photo.existing" type="button" :aria-label="`Retirer ${photo.alt}`" @click="removePhoto(photo.index)">×</button>
                <span v-if="photo.index === 0">Photo principale</span>
              </div>
              <button v-if="photos.length && photos.length < 5" class="photo-add" type="button" @click="$refs.photoInput.click()">+<span>Ajouter</span></button>
            </div>
          </section>

          <div v-if="submitError" class="submit-message error" role="alert">{{ submitError }}</div>
          <div class="form-actions">
            <button class="secondary-action" type="button" @click="goBack">Annuler</button>
            <button class="primary-action" type="submit" :disabled="submitting || !isOnline">
              {{ submitting ? 'Envoi en cours…' : isEditing ? 'Renvoyer ma proposition' : 'Envoyer ma proposition' }}
            </button>
          </div>
          <p v-if="!isOnline" class="offline-note">Une connexion internet est nécessaire pour envoyer des photos.</p>
        </template>
      </form>
    </main>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from '@/axios.js';
import SubmissionPageHeader from './SubmissionPageHeader.vue';
import buildingIcon from '@fortawesome/fontawesome-free/svgs/solid/building.svg?raw';
import ghostIcon from '@fortawesome/fontawesome-free/svgs/solid/ghost.svg?raw';
import landmarkIcon from '@fortawesome/fontawesome-free/svgs/solid/landmark.svg?raw';
import locationDotIcon from '@fortawesome/fontawesome-free/svgs/solid/location-dot.svg?raw';
import questionIcon from '@fortawesome/fontawesome-free/svgs/solid/question.svg?raw';
import treeIcon from '@fortawesome/fontawesome-free/svgs/solid/tree.svg?raw';

const route = useRoute();
const router = useRouter();
const store = useStore();
const pickerMapElement = ref(null);
const photoInput = ref(null);
const photos = ref([]);
const previews = ref([]);
const existingPhotos = ref([]);
const loading = ref(false);
const locating = ref(false);
const submitting = ref(false);
const submitError = ref('');
const locationMessage = ref('Cliquez sur la carte pour placer le repère.');
const form = reactive({ title: '', category: '', description: '', lat: null, lng: null });
const errors = reactive({ title: '', category: '', coordinates: '', photos: '' });
let map = null;
let marker = null;

const categories = [
  { value: 'nature', label: 'Nature', icon: treeIcon },
  { value: 'historique', label: 'Historique', icon: landmarkIcon },
  { value: 'urbain', label: 'Urbain', icon: buildingIcon },
  { value: 'frisson', label: 'Frisson', icon: ghostIcon },
  { value: 'secret', label: 'Secret', icon: questionIcon },
];
const locationIcon = locationDotIcon;
const isEditing = computed(() => route.name === 'ModifierProposition');
const isOnline = computed(() => store.state.isOnline);
const hasCoordinates = computed(() => Number.isFinite(form.lat) && Number.isFinite(form.lng));
const formattedCoordinates = computed(() => hasCoordinates.value ? `${form.lat.toFixed(5)}, ${form.lng.toFixed(5)}` : '');
const displayedPhotos = computed(() => {
  if (photos.value.length) return previews.value.map((url, index) => ({ key: url, url, index, alt: `Photo ${index + 1}` }));
  return existingPhotos.value.map((photo, index) => ({ key: photo.id, url: photo.thumbnailUrl, index, alt: `Photo actuelle ${index + 1}`, existing: true }));
});

function initMap() {
  map = L.map(pickerMapElement.value, { zoomControl: true }).setView([46.7, 2.4], 5);
  L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap France' }).addTo(map);
  map.on('click', event => setCoordinates(event.latlng.lat, event.latlng.lng, true));
  if (hasCoordinates.value) setCoordinates(form.lat, form.lng, true);
  setTimeout(() => map?.invalidateSize(), 100);
}

function setCoordinates(lat, lng, focus = false) {
  form.lat = Number(lat);
  form.lng = Number(lng);
  errors.coordinates = '';
  locationMessage.value = '';
  if (!marker) {
    marker = L.marker([lat, lng], { draggable: true }).addTo(map);
    marker.on('dragend', event => {
      const position = event.target.getLatLng();
      setCoordinates(position.lat, position.lng);
    });
  } else marker.setLatLng([lat, lng]);
  if (focus) map.setView([lat, lng], Math.max(map.getZoom(), 15), { animate: true });
}

function useMyLocation() {
  if (!navigator.geolocation) {
    locationMessage.value = 'La géolocalisation n’est pas disponible sur cet appareil.';
    return;
  }
  locating.value = true;
  navigator.geolocation.getCurrentPosition(
    position => {
      setCoordinates(position.coords.latitude, position.coords.longitude, true);
      store.commit('setUserPosition', { lat: position.coords.latitude, lng: position.coords.longitude });
      locating.value = false;
    },
    () => {
      locationMessage.value = 'Position indisponible. Placez le repère directement sur la carte.';
      locating.value = false;
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
  );
}

function handlePhotos(event) {
  const selected = Array.from(event.target.files || []);
  errors.photos = '';
  if (selected.length > 5) errors.photos = 'Vous pouvez ajouter 5 photos maximum.';
  const limited = selected.slice(0, 5);
  const invalid = limited.find(file => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024);
  if (invalid) {
    errors.photos = `${invalid.name} doit être au format JPEG, PNG ou WebP et peser moins de 2 Mo.`;
    event.target.value = '';
    return;
  }
  clearPreviews();
  photos.value = limited;
  previews.value = limited.map(file => URL.createObjectURL(file));
  event.target.value = '';
}

function removePhoto(index) {
  URL.revokeObjectURL(previews.value[index]);
  photos.value.splice(index, 1);
  previews.value.splice(index, 1);
}

function clearPreviews() {
  previews.value.forEach(url => URL.revokeObjectURL(url));
  previews.value = [];
}

function validate() {
  errors.title = form.title.length >= 3 ? '' : 'Saisissez un nom d’au moins 3 caractères.';
  errors.category = form.category ? '' : 'Choisissez une catégorie.';
  errors.coordinates = hasCoordinates.value ? '' : 'Indiquez la position du lieu sur la carte.';
  errors.photos = (!isEditing.value && photos.value.length === 0) ? 'Ajoutez au moins une photo.' : errors.photos;
  if (errors.coordinates) locationMessage.value = errors.coordinates;
  return !errors.title && !errors.category && !errors.coordinates && !errors.photos;
}

async function loadSubmission() {
  loading.value = true;
  try {
    const response = await axios.get(`/api/place-submissions/${route.params.id}`);
    const submission = response.data.submission;
    if (submission.status !== 'needs_changes') {
      await router.replace({ name: 'MesPropositions' });
      return;
    }
    form.title = submission.title;
    form.category = submission.category;
    form.description = submission.description || '';
    form.lat = Number(submission.coordinates?.lat);
    form.lng = Number(submission.coordinates?.lng);
    existingPhotos.value = submission.photos || [];
  } catch (error) {
    submitError.value = error.response?.data?.message || 'Impossible de charger cette proposition.';
  } finally {
    loading.value = false;
  }
}

async function submitForm() {
  submitError.value = '';
  if (!validate()) return;
  submitting.value = true;
  const payload = new FormData();
  payload.append('title', form.title);
  payload.append('category', form.category);
  payload.append('description', form.description);
  payload.append('coordinates', JSON.stringify({ lat: form.lat, lng: form.lng }));
  photos.value.forEach(photo => payload.append('photos', photo));
  try {
    const url = isEditing.value ? `/api/place-submissions/${route.params.id}/resubmit` : '/api/place-submissions';
    const requestId = globalThis.crypto?.randomUUID?.() || `submission-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const config = isEditing.value ? {} : { headers: { 'Idempotency-Key': requestId } };
    await axios.post(url, payload, config);
    await router.push({ name: 'MesPropositions', query: { sent: '1' } });
  } catch (error) {
    submitError.value = error.response?.data?.message || 'Impossible d’envoyer la proposition. Réessayez dans un instant.';
  } finally {
    submitting.value = false;
  }
}

function goBack() { router.back(); }

onMounted(async () => {
  if (isEditing.value) await loadSubmission();
  await nextTick();
  initMap();
});
onBeforeUnmount(() => { clearPreviews(); map?.remove(); });
</script>

<style scoped>
.submission-page { min-height: 100vh; background: var(--color-pangeas-bg); color: var(--color-auth-text); }
.submission-main { display: grid; gap: 2rem; width: min(100%, 74rem); margin: 0 auto; padding: 8.25rem 1rem 7rem; }
.submission-intro { align-self: start; padding: 1rem 0.35rem; }
.eyebrow { margin-bottom: 0.65rem; color: #8a6d62; font-size: 0.7rem; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase; }
.submission-intro h1 { max-width: 36rem; margin-bottom: 0.85rem; color: var(--color-pangeas-primary); font-size: clamp(1.8rem, 5vw, 2.65rem); line-height: 1.15; }
.submission-intro > p:last-of-type { max-width: 35rem; color: var(--color-pangeas-muted); line-height: 1.65; }
.reward-note { display: flex; gap: 0.8rem; margin-top: 1.4rem; padding: 0.95rem; border: 1px solid #c9ddcf; border-radius: 0.85rem; background: #edf6f0; color: #395744; font-size: 0.85rem; line-height: 1.45; }
.reward-note > span { font-size: 1.25rem; }
.submission-form { display: grid; gap: 1rem; min-width: 0; }
.form-card, .state-card { min-width: 0; padding: 1.15rem; border: 1px solid rgba(205, 184, 176, 0.85); border-radius: 1rem; background: rgba(247, 243, 238, 0.9); box-shadow: var(--shadow-pangeas-card); }
.card-heading { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem; }
.card-heading > span { display: grid; place-items: center; width: 2.45rem; height: 2.45rem; flex: 0 0 auto; border-radius: 0.75rem; background: var(--color-pangeas-primary); color: white; font-weight: 900; }
.card-heading h2 { color: var(--color-pangeas-primary); font-size: 1.3rem; }
.card-heading p { color: var(--color-pangeas-muted); font-size: 0.78rem; }
.field { position: relative; display: grid; gap: 0.45rem; margin-top: 1rem; color: var(--color-pangeas-primary); font-size: 0.86rem; font-weight: 900; }
.field b, .field-error { color: var(--color-pangeas-danger); }
.field em { margin-left: 0.35rem; color: var(--color-pangeas-muted); font-size: 0.72rem; font-weight: 700; }
.field input[type='text'], .field textarea { width: 100%; padding: 0.85rem 0.95rem; border: 1px solid var(--color-pangeas-line); border-radius: 0.7rem; outline: 0; background: var(--color-pangeas-bg); color: var(--color-auth-text); font: 700 0.92rem var(--font-content); }
.field input:focus, .field textarea:focus { border-color: var(--color-pangeas-primary-soft); box-shadow: 0 0 0 3px rgba(93, 64, 55, 0.1); }
.field textarea { resize: vertical; }
.character-count { position: absolute; right: 0.7rem; bottom: 0.5rem; color: var(--color-pangeas-muted); font-size: 0.68rem; }
.category-field { border: 0; padding: 0; }
.category-field legend { margin-bottom: 0.45rem; }
.category-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.5rem; }
.category-grid label { display: flex; align-items: center; gap: 0.5rem; min-width: 0; min-height: 2.85rem; padding: 0.65rem; border: 1px solid var(--color-pangeas-line); border-radius: 0.7rem; background: var(--color-pangeas-bg); color: var(--color-pangeas-muted); cursor: pointer; }
.category-grid label.selected { border-color: var(--color-pangeas-primary); background: var(--color-pangeas-primary); color: white; }
.category-grid input { position: absolute; opacity: 0; pointer-events: none; }
.category-icon { width: 1rem; flex: 0 0 auto; }
.category-icon :deep(svg) { width: 100%; height: 1rem; fill: currentColor; }
.location-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
.location-actions button { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.7rem 0.85rem; border: 1px solid var(--color-pangeas-primary); border-radius: 999px; color: var(--color-pangeas-primary); font-weight: 900; }
.location-actions button span { display: inline-flex; width: 0.9rem; }
.location-actions button span :deep(svg) { width: 100%; fill: currentColor; }
.location-actions p { color: var(--color-pangeas-muted); font-size: 0.76rem; }
.location-map { width: 100%; height: 17rem; overflow: hidden; border: 1px solid var(--color-pangeas-line); border-radius: 0.85rem; background: #e8e2dc; z-index: 0; }
.location-confirmation { display: flex; align-items: center; gap: 0.65rem; margin-top: 0.7rem; padding: 0.7rem 0.8rem; border-radius: 0.7rem; background: #edf6f0; color: #395744; font-size: 0.76rem; }
.location-confirmation > span { display: grid; place-items: center; width: 1.6rem; height: 1.6rem; border-radius: 50%; background: #c8ead8; }
.location-message { display: block; margin-top: 0.5rem; color: var(--color-pangeas-muted); font-size: 0.76rem; }
.location-message.error { color: var(--color-pangeas-danger); }
.photo-dropzone { display: grid; justify-items: center; gap: 0.35rem; padding: 1.5rem 1rem; border: 1px dashed #a78e85; border-radius: 0.85rem; background: var(--color-pangeas-bg); color: var(--color-pangeas-primary); text-align: center; cursor: pointer; }
.photo-dropzone.has-error { border-color: var(--color-pangeas-danger); }
.photo-dropzone input { position: absolute; width: 1px; height: 1px; opacity: 0; }
.photo-dropzone img { width: 1.5rem; }
.photo-dropzone span, .existing-note { color: var(--color-pangeas-muted); font-size: 0.72rem; font-weight: 700; }
.existing-note { display: block; margin-top: 0.55rem; }
.field-error { display: block; margin-top: 0.35rem; font-size: 0.76rem; font-weight: 800; }
.photo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.55rem; margin-top: 0.85rem; }
.photo-preview { position: relative; overflow: hidden; aspect-ratio: 1; border-radius: 0.7rem; background: #e7ddd7; }
.photo-preview > img { width: 100%; height: 100%; object-fit: cover; }
.photo-preview > button { position: absolute; top: 0.35rem; right: 0.35rem; display: grid; place-items: center; width: 1.75rem; height: 1.75rem; border-radius: 50%; background: rgba(32, 24, 20, 0.72); color: white; font-size: 1.25rem; }
.photo-preview > span { position: absolute; inset: auto 0 0; padding: 0.3rem; background: rgba(68, 42, 34, 0.82); color: white; font-size: 0.62rem; font-weight: 900; text-align: center; }
.photo-add { display: grid; place-content: center; aspect-ratio: 1; border: 1px dashed #a78e85; border-radius: 0.7rem; color: var(--color-pangeas-primary); font-size: 1.5rem; }
.photo-add span { display: block; font-size: 0.65rem; font-weight: 900; }
.form-actions { display: grid; grid-template-columns: 0.85fr 1.5fr; gap: 0.7rem; margin-top: 0.25rem; }
.form-actions button { min-height: 3.2rem; padding: 0.7rem; border-radius: 999px; font-weight: 900; }
.secondary-action { border: 1px solid var(--color-pangeas-line); background: var(--color-pangeas-bg); color: var(--color-pangeas-primary); }
.primary-action { background: var(--color-pangeas-primary); color: white; }
.primary-action:disabled { opacity: 0.55; cursor: not-allowed; }
.submit-message { padding: 0.85rem; border-radius: 0.7rem; font-size: 0.82rem; font-weight: 800; }
.submit-message.error { background: #fbe9e7; color: #8b2723; }
.offline-note { color: var(--color-pangeas-danger); font-size: 0.76rem; text-align: center; }

@media (min-width: 768px) {
  .submission-main { grid-template-columns: minmax(15rem, 0.8fr) minmax(30rem, 1.3fr); gap: 4rem; padding: 9rem 3rem 4rem; }
  .submission-intro { position: sticky; top: 8rem; }
  .form-card { padding: 1.6rem; }
  .category-grid { grid-template-columns: repeat(5, minmax(0, 1fr)); }
  .category-grid label { justify-content: center; flex-direction: column; text-align: center; }
  .photo-grid { grid-template-columns: repeat(5, 1fr); }
}
</style>
