<template>
  <div class="submission-review">
    <button class="btn btn-link px-0 mb-3" type="button" @click="$router.push({ name: 'AdminPlaceSubmissions' })"><i class="fas fa-arrow-left me-2"></i>Retour aux propositions</button>
    <div v-if="loading" class="text-center py-5"><div class="spinner-border text-primary" role="status"></div></div>
    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

    <template v-else-if="submission">
      <div class="review-heading mb-4"><div><div class="d-flex align-items-center gap-2 mb-2"><span :class="['submission-status', submission.status]">{{ statusLabel(submission.status) }}</span><span class="text-muted small">Demande #{{ submission.id }}</span></div><h1 class="h3 mb-1 text-gray-800">{{ submission.title }}</h1><p class="mb-0">Proposé par <strong>{{ submission.user?.pseudo }}</strong> le {{ formatDate(submission.createdAt) }}</p></div></div>

      <div class="review-layout">
        <div class="review-content">
          <section class="card shadow-sm mb-4"><div class="card-header fw-bold">Contenu envoyé</div><div class="card-body">
            <div class="photo-gallery"><a v-for="photo in submission.photos" :key="photo.id" :href="photo.url" target="_blank" rel="noopener"><img :src="photo.thumbnailUrl" alt="Photo proposée" /></a></div>
            <dl class="row mb-0 mt-4"><dt class="col-sm-3">Catégorie</dt><dd class="col-sm-9 text-capitalize">{{ submission.category }}</dd><dt class="col-sm-3">Description</dt><dd class="col-sm-9">{{ submission.description || 'Aucune description' }}</dd><dt class="col-sm-3">Coordonnées</dt><dd class="col-sm-9">{{ submission.coordinates.lat }}, {{ submission.coordinates.lng }}</dd></dl>
          </div></section>

          <section v-if="submission.nearbyPlaces?.length" class="card shadow-sm mb-4"><div class="card-header fw-bold"><i class="fas fa-triangle-exclamation text-warning me-2"></i>Lieux similaires à proximité</div><div class="list-group list-group-flush"><div v-for="place in submission.nearbyPlaces" :key="place.id" class="list-group-item d-flex justify-content-between"><span><strong>{{ place.name }}</strong> · {{ place.category }}</span><span>{{ place.distanceMeters }} m</span></div></div></section>

          <section v-if="submission.moderations?.length" class="card shadow-sm"><div class="card-header fw-bold">Historique de modération</div><div class="card-body moderation-list"><div v-for="moderation in submission.moderations" :key="moderation.id"><span class="moderation-mark"></span><p><strong>{{ actionLabel(moderation.action) }}</strong> par {{ moderation.admin?.pseudo }}<small>{{ formatDateTime(moderation.createdAt) }}</small><span>{{ moderation.comment }}</span></p></div></div></section>
        </div>

        <aside class="review-sidebar">
          <section v-if="submission.status === 'pending'" class="card shadow-sm publication-card"><div class="card-header bg-primary text-white fw-bold">Préparer la publication</div><form class="card-body" @submit.prevent="publishSubmission">
            <label class="form-label">Nom public</label><input v-model.trim="place.name" class="form-control mb-3" required maxlength="150" />
            <div class="row"><div class="col-sm-6"><label class="form-label">Département</label><input v-model.trim="place.department" class="form-control mb-3" required /></div><div class="col-sm-6"><label class="form-label">Région</label><input v-model.trim="place.region" class="form-control mb-3" required /></div></div>
            <label class="form-label">Catégorie</label><select v-model="place.category" class="form-select mb-3" required><option v-for="category in categories" :key="category" :value="category">{{ category }}</option></select>
            <label class="form-label">Description éditoriale</label><textarea v-model.trim="place.description" class="form-control mb-3" rows="4" required></textarea>
            <label class="form-label">Légende / histoire</label><textarea v-model.trim="place.legend" class="form-control mb-3" rows="3" required></textarea>
            <label class="form-label">Anecdote</label><textarea v-model.trim="place.anecdote" class="form-control mb-3" rows="3" required></textarea>
            <label class="form-label">Activités <small class="text-muted">séparées par des virgules</small></label><input v-model.trim="activitiesText" class="form-control mb-3" required placeholder="Randonnée, photographie" />
            <div class="row"><div class="col-6"><label class="form-label">Latitude</label><input v-model.number="place.coordinates.lat" class="form-control mb-3" type="number" step="any" required /></div><div class="col-6"><label class="form-label">Longitude</label><input v-model.number="place.coordinates.lng" class="form-control mb-3" type="number" step="any" required /></div></div>
            <label class="form-label">Distance indicative (km)</label><input v-model.number="place.distance_km" class="form-control mb-3" type="number" min="0" step="0.1" required />
            <label class="form-label">Message au contributeur <small class="text-muted">facultatif</small></label><textarea v-model.trim="publishComment" class="form-control mb-3" rows="2" placeholder="Le message par défaut indiquera les points gagnés."></textarea>
            <button class="btn btn-success w-100" type="submit" :disabled="processing"><i class="fas fa-check me-2"></i>{{ processing ? 'Publication…' : 'Publier le lieu' }}</button>
          </form></section>

          <section v-if="submission.status === 'pending'" class="card shadow-sm mt-3"><div class="card-body d-grid gap-2"><button class="btn btn-warning" type="button" :disabled="processing" @click="moderate('request-changes')"><i class="fas fa-pen me-2"></i>Demander des compléments</button><button class="btn btn-outline-danger" type="button" :disabled="processing" @click="moderate('reject')"><i class="fas fa-times me-2"></i>Refuser la proposition</button></div></section>
          <div v-else class="alert alert-secondary">Cette proposition a déjà été traitée. Aucune nouvelle action n’est disponible.</div>
        </aside>
      </div>
    </template>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import axios from '@/axios.js';
const route = useRoute(); const router = useRouter(); const submission = ref(null); const loading = ref(true); const error = ref(''); const processing = ref(false); const activitiesText = ref(''); const publishComment = ref('');
const categories = ['nature','historique','urbain','frisson','secret'];
const place = reactive({ name:'',department:'',region:'',category:'',description:'',legend:'',anecdote:'',coordinates:{lat:null,lng:null},distance_km:null });
const labels={pending:'En attente',needs_changes:'À compléter',approved:'Publiée',rejected:'Refusée',cancelled:'Annulée'};
const statusLabel=value=>labels[value]||value; const actionLabel=value=>({approve:'Publication',request_changes:'Compléments demandés',reject:'Refus'}[value]||value);
const formatDate=value=>new Date(value).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'}); const formatDateTime=value=>new Date(value).toLocaleString('fr-FR',{dateStyle:'medium',timeStyle:'short'});
function hydrateForm(data){ place.name=data.title; place.category=data.category; place.description=data.description||''; place.coordinates={lat:Number(data.coordinates?.lat),lng:Number(data.coordinates?.lng)}; }
async function fetchSubmission(){loading.value=true;error.value='';try{const response=await axios.get(`/api/admin/place-submissions/${route.params.id}`);submission.value=response.data.submission;hydrateForm(submission.value);}catch(err){error.value=err.response?.data?.message||'Impossible de charger cette proposition.';}finally{loading.value=false;}}
async function moderate(action){const isChanges=action==='request-changes';const result=await Swal.fire({title:isChanges?'Informations à compléter':'Refuser cette proposition',input:'textarea',inputLabel:'Message envoyé au contributeur',inputPlaceholder:isChanges?'Précisez clairement les informations ou photos attendues.':'Expliquez brièvement la raison du refus.',showCancelButton:true,confirmButtonText:isChanges?'Envoyer la demande':'Confirmer le refus',cancelButtonText:'Annuler',confirmButtonColor:isChanges?'#b7791f':'#ba1a1a',inputValidator:value=>String(value||'').trim().length<3?'Un message explicatif est obligatoire.':undefined});if(!result.isConfirmed)return;processing.value=true;try{await axios.post(`/api/admin/place-submissions/${submission.value.id}/${action}`,{comment:result.value.trim()});await Swal.fire('Mise à jour enregistrée','Le contributeur a été informé.','success');await router.push({name:'AdminPlaceSubmissions'});}catch(err){await Swal.fire('Erreur',err.response?.data?.message||'Impossible de traiter la proposition.','error');}finally{processing.value=false;}}
async function publishSubmission(){const activities=activitiesText.value.split(',').map(value=>value.trim()).filter(Boolean);if(!activities.length){await Swal.fire('Champ incomplet','Ajoutez au moins une activité.','warning');return;}const confirmation=await Swal.fire({title:'Publier ce lieu ?',text:'Le lieu apparaîtra sur la carte et les points seront attribués au contributeur.',icon:'question',showCancelButton:true,confirmButtonText:'Oui, publier',cancelButtonText:'Vérifier encore',confirmButtonColor:'#1b6b45'});if(!confirmation.isConfirmed)return;processing.value=true;try{const response=await axios.post(`/api/admin/place-submissions/${submission.value.id}/publish`,{place:{...place,activities},comment:publishComment.value});if(response.data.success){await Swal.fire('Lieu publié',`${response.data.points||0} points ont été attribués.`, 'success');await router.push({name:'AdminPlaceSubmissions'});}}catch(err){await Swal.fire('Publication impossible',err.response?.data?.message||'Vérifiez tous les champs éditoriaux.','error');}finally{processing.value=false;}}
onMounted(fetchSubmission);
</script>

<style scoped>
.review-layout{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(20rem,.75fr);gap:1.25rem;align-items:start}.review-sidebar{position:sticky;top:1rem}.photo-gallery{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:.6rem}.photo-gallery a{aspect-ratio:1;overflow:hidden;border-radius:.55rem;background:#eee}.photo-gallery img{width:100%;height:100%;object-fit:cover}.submission-status{display:inline-flex;padding:.3rem .6rem;border-radius:999px;background:#fff0d6;color:#79551c;font-size:.72rem;font-weight:800}.submission-status.needs_changes{background:#f8ded6;color:#8b3728}.submission-status.approved{background:#ddefe3;color:#316548}.submission-status.rejected,.submission-status.cancelled{background:#e8e4e1;color:#645d58}.moderation-list{display:grid;gap:.9rem}.moderation-list>div{display:flex;gap:.65rem}.moderation-mark{width:.7rem;height:.7rem;margin-top:.35rem;flex:0 0 auto;border-radius:50%;background:#5d4037}.moderation-list p{display:grid;margin:0}.moderation-list small{color:#777}.moderation-list p>span{margin-top:.25rem}.publication-card .form-label{font-size:.78rem;font-weight:700}.publication-card textarea{resize:vertical}
@media(max-width:1100px){.review-layout{grid-template-columns:1fr}.review-sidebar{position:static}}@media(max-width:575px){.photo-gallery{grid-template-columns:repeat(3,1fr)}.review-heading h1{font-size:1.35rem}}
</style>
