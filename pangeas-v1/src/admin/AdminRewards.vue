<template>
  <main class="admin-rewards">
    <div class="page-heading">
      <div>
        <h1 class="h3 mb-1 text-gray-800">Récompenses</h1>
        <p class="mb-0 text-muted">Gérez les coupons, les campagnes de dons et leurs partenaires.</p>
      </div>
      <button class="btn btn-pangeas" type="button" @click="openCreateForTab">
        <i class="fas fa-plus me-2"></i>
        {{ createLabel }}
      </button>
    </div>

    <div class="row summary-row">
      <div v-for="item in summaryCards" :key="item.label" class="col-sm-6 col-xl-3 mb-3">
        <div class="card summary-card shadow-sm h-100">
          <div class="card-body d-flex align-items-center justify-content-between">
            <div>
              <small>{{ item.label }}</small>
              <strong>{{ item.value }}</strong>
            </div>
            <span><i :class="item.icon"></i></span>
          </div>
        </div>
      </div>
    </div>

    <nav class="admin-tabs" aria-label="Gestion des récompenses">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <i :class="tab.icon"></i>
        <span>{{ tab.label }}</span>
        <small v-if="tab.count !== null">{{ tab.count }}</small>
      </button>
    </nav>

    <div v-if="loading" class="loading-card card shadow-sm">
      <span class="spinner-border" aria-hidden="true"></span>
      <p>Chargement des données…</p>
    </div>
    <div v-else-if="loadError" class="alert alert-danger d-flex justify-content-between align-items-center">
      <span>{{ loadError }}</span>
      <button class="btn btn-outline-danger btn-sm" @click="loadAll">Réessayer</button>
    </div>

    <section v-else-if="activeTab === 'rewards'" class="card shadow-sm content-card">
      <div class="card-header">
        <div>
          <strong>Offres coupons</strong>
          <small>Les offres inactives restent conservées dans l’historique.</small>
        </div>
        <StatusFilter v-model="statusFilter" />
      </div>
      <div class="table-responsive">
        <table class="table align-middle mb-0">
          <thead>
            <tr>
              <th>Offre</th>
              <th>Partenaire</th>
              <th>Coût</th>
              <th>Stock total</th>
              <th>Statut</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="reward in filteredRewards" :key="reward.id">
              <td>
                <strong>{{ reward.name }}</strong>
                <small>{{ reward.scope || 'Sans catégorie' }}</small>
              </td>
              <td>{{ reward.partner?.name || '—' }}</td>
              <td>{{ formatNumber(reward.pointsCost) }} pts</td>
              <td>{{ availableCodes(reward) }} / {{ reward._count?.couponCodes || 0 }}</td>
              <td>
                <span :class="['status-badge', reward.isActive ? 'active' : 'inactive']">
                  {{ reward.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="actions text-end">
                <button class="btn-icon view" title="Voir l’offre" @click="viewReward(reward)">
                  <i class="fas fa-eye"></i>
                </button>
                <button class="btn-icon codes" title="Ajouter des codes" @click="openCodes(reward)">
                  <i class="fas fa-ticket-alt"></i>
                </button>
                <button class="btn-icon edit" title="Modifier" @click="openRewardForm(reward)">
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  :class="['btn-icon', reward.isActive ? 'remove' : 'restore']"
                  :title="reward.isActive ? 'Désactiver' : 'Réactiver'"
                  @click="toggleReward(reward)"
                >
                  <i :class="reward.isActive ? 'fas fa-trash' : 'fas fa-undo'"></i>
                </button>
              </td>
            </tr>
            <tr v-if="!filteredRewards.length">
              <td colspan="6"><EmptyRow text="Aucune offre ne correspond à ce filtre." /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-else-if="activeTab === 'campaigns'" class="card shadow-sm content-card">
      <div class="card-header">
        <div>
          <strong>Campagnes de dons</strong>
          <small>Suivez le financement et le budget partenaire.</small>
        </div>
        <StatusFilter v-model="statusFilter" />
      </div>
      <div class="campaign-grid">
        <article v-for="campaign in filteredCampaigns" :key="campaign.id" class="campaign-card">
          <div class="campaign-head">
            <span class="campaign-logo">{{ initial(campaign.partner?.name || campaign.name) }}</span>
            <span :class="['status-badge', campaign.isActive ? 'active' : 'inactive']">
              {{ campaign.isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>
          <small>{{ campaign.partner?.name || 'Sans partenaire' }}</small>
          <h2>{{ campaign.name }}</h2>
          <p>{{ campaign.description || 'Aucune description.' }}</p>
          <div class="campaign-numbers">
            <span>
              <small>Collecté</small>
              <strong>{{ formatCurrency(campaign.currentAmount) }}</strong>
            </span>
            <span>
              <small>Objectif</small>
              <strong>{{ campaign.goalAmount ? formatCurrency(campaign.goalAmount) : 'Libre' }}</strong>
            </span>
            <span>
              <small>Coût / €</small>
              <strong>{{ formatNumber(campaign.pointsPerEuro) }} pts</strong>
            </span>
          </div>
          <div v-if="campaign.goalAmount" class="campaign-progress">
            <span><i :style="{ width: `${campaignProgress(campaign)}%` }"></i></span>
            <small>{{ campaignProgress(campaign) }} % de l’objectif</small>
          </div>
          <footer>
            <span>{{ campaign._count?.donations || 0 }} don{{ campaign._count?.donations > 1 ? 's' : '' }}</span>
            <div class="actions">
              <button class="btn-icon edit" title="Modifier" @click="openCampaignForm(campaign)">
                <i class="fas fa-edit"></i>
              </button>
              <button
                :class="['btn-icon', campaign.isActive ? 'remove' : 'restore']"
                :title="campaign.isActive ? 'Désactiver' : 'Réactiver'"
                @click="toggleCampaign(campaign)"
              >
                <i :class="campaign.isActive ? 'fas fa-trash' : 'fas fa-undo'"></i>
              </button>
            </div>
          </footer>
        </article>
        <EmptyRow v-if="!filteredCampaigns.length" text="Aucune campagne ne correspond à ce filtre." />
      </div>
    </section>

    <section v-else-if="activeTab === 'donations'" class="card shadow-sm content-card">
      <div class="card-header">
        <div>
          <strong>Dons déclenchés</strong>
          <small>Confirmez ou annulez les demandes en attente.</small>
        </div>
        <select v-model="donationFilter" class="form-select form-select-sm filter-select">
          <option value="all">Tous</option>
          <option value="pending">En attente</option>
          <option value="confirmed">Confirmés</option>
          <option value="cancelled">Annulés</option>
        </select>
      </div>
      <div class="table-responsive">
        <table class="table align-middle mb-0">
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Campagne</th>
              <th>Montant</th>
              <th>Points</th>
              <th>Date</th>
              <th>Statut</th>
              <th class="text-end">Décision</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="donation in filteredDonations" :key="donation.id">
              <td>
                <strong>{{ donation.user?.pseudo || `Utilisateur #${donation.userId}` }}</strong>
                <small>{{ donation.user?.email }}</small>
              </td>
              <td>{{ donation.campaign?.name || '—' }}</td>
              <td>{{ formatCurrency(donation.amount) }}</td>
              <td>{{ formatNumber(donation.pointsSpent) }}</td>
              <td>{{ formatDate(donation.createdAt) }}</td>
              <td>
                <span :class="['status-badge', donation.status]">{{ donationStatus(donation.status) }}</span>
              </td>
              <td class="actions text-end">
                <template v-if="donation.status === 'pending'">
                  <button class="btn-icon restore" title="Confirmer" @click="updateDonation(donation, 'confirmed')">
                    <i class="fas fa-check"></i>
                  </button>
                  <button
                    class="btn-icon remove"
                    title="Annuler et rembourser"
                    @click="updateDonation(donation, 'cancelled')"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </template>
                <span v-else class="text-muted">Traité</span>
              </td>
            </tr>
            <tr v-if="!filteredDonations.length">
              <td colspan="7"><EmptyRow text="Aucun don ne correspond à ce filtre." /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-else class="card shadow-sm content-card">
      <div class="card-header">
        <div>
          <strong>Partenaires</strong>
          <small>Les partenaires inactifs ne sont plus visibles côté utilisateur.</small>
        </div>
        <StatusFilter v-model="statusFilter" />
      </div>
      <div class="partner-grid">
        <article v-for="partner in filteredPartners" :key="partner.id" class="partner-card">
          <span class="partner-logo">
            <img v-if="partner.logoUrl" :src="partner.logoUrl" alt="" @error="$event.target.style.display = 'none'" />
            <b>{{ initial(partner.name) }}</b>
          </span>
          <div>
            <span :class="['status-badge', partner.isActive ? 'active' : 'inactive']">
              {{ partner.isActive ? 'Actif' : 'Inactif' }}
            </span>
            <h2>{{ partner.name }}</h2>
            <p>{{ partner.description || 'Aucune description.' }}</p>
            <small>{{ partner._count?.rewards || 0 }} offre{{ partner._count?.rewards > 1 ? 's' : '' }}</small>
          </div>
          <footer class="actions">
            <button class="btn-icon edit" title="Modifier" @click="openPartnerForm(partner)">
              <i class="fas fa-edit"></i>
            </button>
            <button
              :class="['btn-icon', partner.isActive ? 'remove' : 'restore']"
              :title="partner.isActive ? 'Désactiver' : 'Réactiver'"
              @click="togglePartner(partner)"
            >
              <i :class="partner.isActive ? 'fas fa-trash' : 'fas fa-undo'"></i>
            </button>
          </footer>
        </article>
        <EmptyRow v-if="!filteredPartners.length" text="Aucun partenaire ne correspond à ce filtre." />
      </div>
    </section>

    <transition name="modal-fade">
      <div v-if="modal" class="modal-backdrop-custom" @click.self="closeModal">
        <section class="admin-modal" role="dialog" aria-modal="true" :aria-labelledby="'modal-title'">
          <header>
            <div>
              <small>{{ modal.eyebrow }}</small>
              <h2 id="modal-title">{{ modal.title }}</h2>
            </div>
            <button type="button" aria-label="Fermer" @click="closeModal">×</button>
          </header>
          <form v-if="modal.type === 'reward-form'" class="form-grid" @submit.prevent="saveReward">
            <FormField label="Nom *"><input v-model.trim="rewardForm.name" required maxlength="160" /></FormField>
            <FormField label="Partenaire *">
              <select v-model.number="rewardForm.partnerId" required>
                <option disabled value="">Sélectionner</option>
                <option v-for="partner in activePartners" :key="partner.id" :value="partner.id">
                  {{ partner.name }}
                </option>
              </select>
            </FormField>
            <FormField label="Coût en points *">
              <input v-model.number="rewardForm.pointsCost" type="number" min="1" required />
            </FormField>
            <FormField label="Catégorie">
              <input v-model.trim="rewardForm.scope" placeholder="Équipement, culture…" />
            </FormField>
            <FormField label="Réduction (%)">
              <input v-model.number="rewardForm.discountPercent" type="number" min="1" max="100" />
            </FormField>
            <FormField label="Achat minimum (€)">
              <input v-model.number="rewardForm.minimumPurchase" type="number" min="0" step="0.01" />
            </FormField>
            <FormField label="Réduction maximale (€)">
              <input v-model.number="rewardForm.maxDiscount" type="number" min="0" step="0.01" />
            </FormField>
            <FormField label="Limite par utilisateur">
              <input v-model.number="rewardForm.perUserLimit" type="number" min="1" max="100" />
            </FormField>
            <FormField label="Début"><input v-model="rewardForm.startsAt" type="datetime-local" /></FormField>
            <FormField label="Fin"><input v-model="rewardForm.endsAt" type="datetime-local" /></FormField>
            <FormField label="URL de l’image" wide><input v-model.trim="rewardForm.imageUrl" type="url" /></FormField>
            <FormField label="Description" wide>
              <textarea v-model.trim="rewardForm.description" rows="3"></textarea>
            </FormField>
            <FormField label="Conditions" wide>
              <textarea v-model.trim="rewardForm.terms" rows="3"></textarea>
            </FormField>
            <label class="switch-field wide">
              <input v-model="rewardForm.isActive" type="checkbox" />
              <span></span>
              Offre active
            </label>
            <ModalActions :saving="saving" @cancel="closeModal" />
          </form>
          <form v-else-if="modal.type === 'campaign-form'" class="form-grid" @submit.prevent="saveCampaign">
            <FormField label="Nom *"><input v-model.trim="campaignForm.name" required maxlength="160" /></FormField>
            <FormField label="Partenaire *">
              <select v-model.number="campaignForm.partnerId" required>
                <option disabled value="">Sélectionner</option>
                <option v-for="partner in activePartners" :key="partner.id" :value="partner.id">
                  {{ partner.name }}
                </option>
              </select>
            </FormField>
            <FormField label="Points par euro *">
              <input v-model.number="campaignForm.pointsPerEuro" type="number" min="100" max="5000" required />
            </FormField>
            <FormField label="Objectif (€)">
              <input v-model.number="campaignForm.goalAmount" type="number" min="1" step="0.01" />
            </FormField>
            <FormField label="Budget partenaire (€)">
              <input v-model.number="campaignForm.budgetAmount" type="number" min="1" step="0.01" />
            </FormField>
            <FormField label="URL de l’image"><input v-model.trim="campaignForm.imageUrl" type="url" /></FormField>
            <FormField label="Début"><input v-model="campaignForm.startDate" type="datetime-local" /></FormField>
            <FormField label="Fin"><input v-model="campaignForm.endDate" type="datetime-local" /></FormField>
            <FormField label="Description" wide>
              <textarea v-model.trim="campaignForm.description" rows="4"></textarea>
            </FormField>
            <label class="switch-field wide">
              <input v-model="campaignForm.isActive" type="checkbox" />
              <span></span>
              Campagne active
            </label>
            <ModalActions :saving="saving" @cancel="closeModal" />
          </form>
          <form v-else-if="modal.type === 'partner-form'" class="form-grid" @submit.prevent="savePartner">
            <FormField label="Nom *" wide><input v-model.trim="partnerForm.name" required maxlength="120" /></FormField>
            <FormField label="Site web"><input v-model.trim="partnerForm.websiteUrl" type="url" /></FormField>
            <FormField label="URL du logo"><input v-model.trim="partnerForm.logoUrl" type="url" /></FormField>
            <FormField label="Description" wide>
              <textarea v-model.trim="partnerForm.description" rows="4"></textarea>
            </FormField>
            <label class="switch-field wide">
              <input v-model="partnerForm.isActive" type="checkbox" />
              <span></span>
              Partenaire actif
            </label>
            <ModalActions :saving="saving" @cancel="closeModal" />
          </form>
          <form v-else-if="modal.type === 'codes'" @submit.prevent="addCodes">
            <div class="codes-help">
              <i class="fas fa-info-circle"></i>
              <p>
                Un code par ligne. Lettres, chiffres, tirets et underscores uniquement. Les doublons seront refusés.
              </p>
            </div>
            <FormField label="Codes coupons *" wide>
              <textarea
                v-model="codesForm.codes"
                rows="8"
                required
                placeholder="PANGEAS-001&#10;PANGEAS-002"
              ></textarea>
            </FormField>
            <FormField label="Expiration commune" wide>
              <input v-model="codesForm.expiresAt" type="datetime-local" />
            </FormField>
            <ModalActions :saving="saving" submit-label="Ajouter les codes" @cancel="closeModal" />
          </form>
          <div v-else-if="modal.type === 'reward-detail'" class="reward-detail">
            <div class="detail-summary">
              <span class="detail-logo">{{ initial(selectedReward.partner?.name || selectedReward.name) }}</span>
              <div>
                <small>{{ selectedReward.partner?.name }}</small>
                <h3>{{ selectedReward.name }}</h3>
                <p>{{ selectedReward.description || 'Aucune description.' }}</p>
              </div>
              <span :class="['status-badge', selectedReward.isActive ? 'active' : 'inactive']">
                {{ selectedReward.isActive ? 'Active' : 'Inactive' }}
              </span>
            </div>
            <div class="detail-stats">
              <span>
                <small>Coût</small>
                <strong>{{ formatNumber(selectedReward.pointsCost) }} pts</strong>
              </span>
              <span>
                <small>Codes</small>
                <strong>{{ selectedReward.couponCodes?.length || 0 }}</strong>
              </span>
              <span>
                <small>Échanges</small>
                <strong>{{ selectedReward._count?.redemptions || 0 }}</strong>
              </span>
            </div>
            <h4>Codes coupons</h4>
            <div class="codes-table">
              <div v-for="code in selectedReward.couponCodes" :key="code.id">
                <code>{{ code.code }}</code>
                <span :class="['status-badge', code.status]">{{ couponStatus(code.status) }}</span>
                <small>{{ code.expiresAt ? `Expire le ${formatDate(code.expiresAt)}` : 'Sans expiration' }}</small>
                <select
                  :value="code.status"
                  :disabled="code.status === 'reserved'"
                  @change="changeCodeStatus(code, $event.target.value)"
                >
                  <option value="available">Disponible</option>
                  <option value="used">Utilisé</option>
                  <option value="expired">Expiré</option>
                  <option v-if="code.status === 'reserved'" value="reserved">Réservé</option>
                </select>
              </div>
              <EmptyRow v-if="!selectedReward.couponCodes?.length" text="Aucun code ajouté à cette offre." />
            </div>
          </div>
        </section>
      </div>
    </transition>
  </main>
</template>

<script setup>
import { computed, defineComponent, h, onMounted, ref } from 'vue';
import axios from '@/axios';
import Swal from 'sweetalert2';

const FormField = defineComponent({
  props: { label: String, wide: Boolean },
  setup(props, { slots }) {
    return () =>
      h('label', { class: ['form-field', { wide: props.wide }] }, [h('span', props.label), slots.default?.()]);
  },
});
const EmptyRow = defineComponent({
  props: { text: String },
  setup: (props) => () => h('div', { class: 'empty-row' }, [h('i', { class: 'fas fa-inbox' }), h('span', props.text)]),
});
const StatusFilter = defineComponent({
  props: { modelValue: String },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () =>
      h(
        'select',
        {
          class: 'form-select form-select-sm filter-select',
          value: props.modelValue,
          onChange: (event) => emit('update:modelValue', event.target.value),
        },
        [
          h('option', { value: 'all' }, 'Tous'),
          h('option', { value: 'active' }, 'Actifs'),
          h('option', { value: 'inactive' }, 'Inactifs'),
        ],
      );
  },
});
const ModalActions = defineComponent({
  props: { saving: Boolean, submitLabel: { type: String, default: 'Enregistrer' } },
  emits: ['cancel'],
  setup(props, { emit }) {
    return () =>
      h('div', { class: 'modal-actions wide' }, [
        h(
          'button',
          { type: 'button', class: 'btn btn-light', disabled: props.saving, onClick: () => emit('cancel') },
          'Annuler',
        ),
        h(
          'button',
          { type: 'submit', class: 'btn modal-submit', disabled: props.saving },
          props.saving ? 'Enregistrement…' : props.submitLabel,
        ),
      ]);
  },
});

const activeTab = ref('rewards'),
  loading = ref(true),
  saving = ref(false),
  loadError = ref('');
const rewards = ref([]),
  campaigns = ref([]),
  donations = ref([]),
  partners = ref([]);
const statusFilter = ref('all'),
  donationFilter = ref('all'),
  modal = ref(null),
  selectedReward = ref({});
const rewardForm = ref({}),
  campaignForm = ref({}),
  partnerForm = ref({}),
  codesForm = ref({ codes: '', expiresAt: '' });
const tabs = computed(() => [
  { id: 'rewards', label: 'Coupons', icon: 'fas fa-ticket-alt', count: rewards.value.length },
  { id: 'campaigns', label: 'Campagnes', icon: 'fas fa-hand-holding-heart', count: campaigns.value.length },
  {
    id: 'donations',
    label: 'Dons',
    icon: 'fas fa-heart',
    count: donations.value.filter((item) => item.status === 'pending').length,
  },
  { id: 'partners', label: 'Partenaires', icon: 'fas fa-handshake', count: partners.value.length },
]);
const summaryCards = computed(() => [
  { label: 'Offres actives', value: rewards.value.filter((item) => item.isActive).length, icon: 'fas fa-ticket-alt' },
  {
    label: 'Codes disponibles',
    value: rewards.value.reduce((sum, item) => sum + availableCodes(item), 0),
    icon: 'fas fa-barcode',
  },
  {
    label: 'Campagnes actives',
    value: campaigns.value.filter((item) => item.isActive).length,
    icon: 'fas fa-hand-holding-heart',
  },
  {
    label: 'Dons à traiter',
    value: donations.value.filter((item) => item.status === 'pending').length,
    icon: 'fas fa-clock',
  },
]);
const createLabel = computed(
  () =>
    ({
      rewards: 'Ajouter une offre',
      campaigns: 'Ajouter une campagne',
      donations: 'Ajouter une campagne',
      partners: 'Ajouter un partenaire',
    })[activeTab.value],
);
const activePartners = computed(() =>
  partners.value.filter(
    (item) => item.isActive || item.id === rewardForm.value.partnerId || item.id === campaignForm.value.partnerId,
  ),
);
const byStatus = (items) =>
  items.filter(
    (item) => statusFilter.value === 'all' || (statusFilter.value === 'active' ? item.isActive : !item.isActive),
  );
const filteredRewards = computed(() => byStatus(rewards.value));
const filteredCampaigns = computed(() => byStatus(campaigns.value));
const filteredPartners = computed(() => byStatus(partners.value));
const filteredDonations = computed(() =>
  donations.value.filter((item) => donationFilter.value === 'all' || item.status === donationFilter.value),
);

onMounted(loadAll);
async function loadAll() {
  loading.value = true;
  loadError.value = '';
  try {
    const [rewardRes, campaignRes, donationRes, partnerRes] = await Promise.all([
      axios.get('/api/admin/rewards'),
      axios.get('/api/admin/donation-campaigns'),
      axios.get('/api/admin/donations'),
      axios.get('/api/admin/partners'),
    ]);
    rewards.value = rewardRes.data.rewards || [];
    campaigns.value = campaignRes.data.campaigns || [];
    donations.value = donationRes.data.donations || [];
    partners.value = partnerRes.data.partners || [];
  } catch (error) {
    loadError.value = error.response?.data?.message || 'Impossible de charger l’espace récompenses.';
  } finally {
    loading.value = false;
  }
}
function closeModal() {
  if (!saving.value) modal.value = null;
}
function openCreateForTab() {
  if (activeTab.value === 'partners') openPartnerForm();
  else if (activeTab.value === 'rewards') openRewardForm();
  else openCampaignForm();
}
function emptyReward() {
  return {
    name: '',
    partnerId: '',
    pointsCost: 500,
    scope: '',
    discountPercent: null,
    minimumPurchase: null,
    maxDiscount: null,
    perUserLimit: 1,
    startsAt: '',
    endsAt: '',
    imageUrl: '',
    description: '',
    terms: '',
    isActive: true,
  };
}
function emptyCampaign() {
  return {
    name: '',
    partnerId: '',
    pointsPerEuro: 400,
    goalAmount: null,
    budgetAmount: null,
    startDate: '',
    endDate: '',
    imageUrl: '',
    description: '',
    isActive: true,
  };
}
function emptyPartner() {
  return { name: '', websiteUrl: '', logoUrl: '', description: '', isActive: true };
}
function toInputDate(value) {
  if (!value) return '';
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
function openRewardForm(item = null) {
  rewardForm.value = item
    ? { ...emptyReward(), ...item, startsAt: toInputDate(item.startsAt), endsAt: toInputDate(item.endsAt) }
    : emptyReward();
  modal.value = {
    type: 'reward-form',
    title: item ? 'Modifier l’offre' : 'Nouvelle offre coupon',
    eyebrow: 'Coupons',
    id: item?.id,
  };
}
function openCampaignForm(item = null) {
  campaignForm.value = item
    ? { ...emptyCampaign(), ...item, startDate: toInputDate(item.startDate), endDate: toInputDate(item.endDate) }
    : emptyCampaign();
  modal.value = {
    type: 'campaign-form',
    title: item ? 'Modifier la campagne' : 'Nouvelle campagne',
    eyebrow: 'Dons',
    id: item?.id,
  };
}
function openPartnerForm(item = null) {
  partnerForm.value = item ? { ...emptyPartner(), ...item } : emptyPartner();
  modal.value = {
    type: 'partner-form',
    title: item ? 'Modifier le partenaire' : 'Nouveau partenaire',
    eyebrow: 'Partenaires',
    id: item?.id,
  };
}
function cleanPayload(data) {
  return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, value === '' ? null : value]));
}
async function runModalSave(operation, successMessage) {
  let completed = false;
  saving.value = true;
  try {
    await operation();
    await loadAll();
    completed = true;
  } catch (error) {
    alertError(error);
  } finally {
    saving.value = false;
    if (completed) {
      closeModal();
      toast(successMessage);
    }
  }
}
async function saveReward() {
  const payload = cleanPayload(rewardForm.value);
  await runModalSave(
    () =>
      modal.value.id
        ? axios.patch(`/api/admin/rewards/${modal.value.id}`, payload)
        : axios.post('/api/admin/rewards', payload),
    'Offre enregistrée.',
  );
}
async function saveCampaign() {
  const payload = cleanPayload(campaignForm.value);
  await runModalSave(
    () =>
      modal.value.id
        ? axios.patch(`/api/admin/donation-campaigns/${modal.value.id}`, payload)
        : axios.post('/api/admin/donation-campaigns', payload),
    'Campagne enregistrée.',
  );
}
async function savePartner() {
  const payload = cleanPayload(partnerForm.value);
  await runModalSave(
    () =>
      modal.value.id
        ? axios.patch(`/api/admin/partners/${modal.value.id}`, payload)
        : axios.post('/api/admin/partners', payload),
    'Partenaire enregistré.',
  );
}
function openCodes(reward) {
  codesForm.value = { codes: '', expiresAt: '' };
  modal.value = { type: 'codes', title: `Ajouter du stock — ${reward.name}`, eyebrow: 'Codes coupons', id: reward.id };
}
async function addCodes() {
  const codes = codesForm.value.codes
    .split(/\r?\n|,/)
    .map((code) => code.trim())
    .filter(Boolean);
  await runModalSave(
    () =>
      axios.post(`/api/admin/rewards/${modal.value.id}/codes`, { codes, expiresAt: codesForm.value.expiresAt || null }),
    `${codes.length} code${codes.length > 1 ? 's ajoutés' : ' ajouté'}.`,
  );
}
async function viewReward(reward) {
  try {
    selectedReward.value = (await axios.get(`/api/admin/rewards/${reward.id}`)).data.reward;
    modal.value = { type: 'reward-detail', title: reward.name, eyebrow: 'Détail de l’offre' };
  } catch (error) {
    alertError(error);
  }
}
async function changeCodeStatus(code, status) {
  try {
    await axios.patch(`/api/admin/coupon-codes/${code.id}/status`, { status });
    code.status = status;
    toast('Statut du code mis à jour.');
  } catch (error) {
    alertError(error);
  }
}
async function confirmToggle(title, text, confirmText) {
  return (
    await Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#5d4037',
    })
  ).isConfirmed;
}
async function toggleReward(item) {
  if (
    item.isActive &&
    !(await confirmToggle(
      'Désactiver cette offre ?',
      'Elle disparaîtra du catalogue mais son historique sera conservé.',
      'Désactiver',
    ))
  )
    return;
  try {
    item.isActive
      ? await axios.delete(`/api/admin/rewards/${item.id}`)
      : await axios.patch(`/api/admin/rewards/${item.id}`, { isActive: true });
    await loadAll();
  } catch (error) {
    alertError(error);
  }
}
async function toggleCampaign(item) {
  if (
    item.isActive &&
    !(await confirmToggle('Désactiver cette campagne ?', 'Aucun nouveau don ne pourra être déclenché.', 'Désactiver'))
  )
    return;
  try {
    item.isActive
      ? await axios.delete(`/api/admin/donation-campaigns/${item.id}`)
      : await axios.patch(`/api/admin/donation-campaigns/${item.id}`, { isActive: true });
    await loadAll();
  } catch (error) {
    alertError(error);
  }
}
async function togglePartner(item) {
  if (
    item.isActive &&
    !(await confirmToggle(
      'Désactiver ce partenaire ?',
      'Ses offres et campagnes ne seront plus proposées aux utilisateurs.',
      'Désactiver',
    ))
  )
    return;
  try {
    item.isActive
      ? await axios.delete(`/api/admin/partners/${item.id}`)
      : await axios.patch(`/api/admin/partners/${item.id}`, { isActive: true });
    await loadAll();
  } catch (error) {
    alertError(error);
  }
}
async function updateDonation(item, status) {
  const cancelling = status === 'cancelled';
  if (
    !(await confirmToggle(
      cancelling ? 'Annuler ce don ?' : 'Confirmer ce don ?',
      cancelling
        ? 'Les points seront automatiquement remboursés à l’utilisateur.'
        : 'Cette action validera définitivement le don.',
      cancelling ? 'Annuler et rembourser' : 'Confirmer',
    ))
  )
    return;
  try {
    await axios.patch(`/api/admin/donations/${item.id}/status`, { status });
    await loadAll();
    toast(cancelling ? 'Don annulé et points remboursés.' : 'Don confirmé.');
  } catch (error) {
    alertError(error);
  }
}
function alertError(error) {
  Swal.fire('Erreur', error.response?.data?.message || 'L’opération n’a pas pu être effectuée.', 'error');
}
function toast(title) {
  Swal.fire({ title, icon: 'success', toast: true, position: 'top-end', timer: 2200, showConfirmButton: false });
}
function formatNumber(value) {
  return new Intl.NumberFormat('fr-FR').format(Number(value) || 0);
}
function formatCurrency(value) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(
    Number(value) || 0,
  );
}
function formatDate(value) {
  return value ? new Date(value).toLocaleDateString('fr-FR') : '—';
}
function initial(value) {
  return String(value || 'P')
    .trim()
    .charAt(0)
    .toUpperCase();
}
function campaignProgress(item) {
  return item.goalAmount ? Math.min(100, Math.round((Number(item.currentAmount) / Number(item.goalAmount)) * 100)) : 0;
}
function availableCodes(item) {
  return (item.couponCodes || []).filter((code) => code.status === 'available').length;
}
function donationStatus(value) {
  return { pending: 'En attente', confirmed: 'Confirmé', cancelled: 'Annulé' }[value] || value;
}
function couponStatus(value) {
  return { available: 'Disponible', reserved: 'Réservé', used: 'Utilisé', expired: 'Expiré' }[value] || value;
}
</script>

<style scoped>
.admin-rewards {
  --admin-primary: #5d4037;
  --admin-dark: #442a22;
  --admin-cream: #eee1c9;
  --admin-line: #e3d8d3;
  color: #352722;
}
.page-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.btn-pangeas {
  border-color: var(--admin-dark);
  background: var(--admin-primary);
  color: #fff;
  font-weight: 700;
}
.btn-pangeas:hover {
  background: var(--admin-dark);
  color: #fff;
}
.summary-card {
  border: 0;
  border-left: 4px solid var(--admin-primary);
}
.summary-card small,
.summary-card strong {
  display: block;
}
.summary-card small {
  color: #81736e;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
}
.summary-card strong {
  margin-top: 0.2rem;
  color: var(--admin-dark);
  font-size: 1.55rem;
}
.summary-card .card-body > span {
  display: grid;
  place-items: center;
  width: 2.8rem;
  height: 2.8rem;
  border-radius: 50%;
  background: #f3eae3;
  color: var(--admin-primary);
}
.admin-tabs {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 1rem;
  padding: 0.35rem;
  overflow-x: auto;
  border: 1px solid #e1d7d2;
  border-radius: 0.7rem;
  background: #fff;
}
.admin-tabs button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 2.8rem;
  padding: 0.65rem 1rem;
  border-radius: 0.5rem;
  color: #6c5d58;
  font-weight: 700;
  white-space: nowrap;
}
.admin-tabs button.active {
  background: var(--admin-primary);
  color: #fff;
  box-shadow: 0 5px 14px #442a2229;
}
.admin-tabs small {
  display: grid;
  place-items: center;
  min-width: 1.3rem;
  height: 1.3rem;
  padding: 0 0.25rem;
  border-radius: 1rem;
  background: #eee1c9;
  color: #442a22;
  font-size: 0.65rem;
}
.loading-card {
  display: grid;
  justify-items: center;
  gap: 0.8rem;
  padding: 4rem;
  color: #71645f;
}
.content-card {
  overflow: hidden;
  border: 0;
}
.content-card > .card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.2rem;
  border-bottom: 1px solid var(--admin-line);
  background: #fff;
}
.card-header > div {
  display: grid;
}
.card-header small {
  color: #81736e;
}
.filter-select {
  width: auto;
  min-width: 8rem;
}
.table thead th {
  border: 0;
  background: #f8f5f3;
  color: #776964;
  font-size: 0.7rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
}
.table tbody td {
  padding: 0.9rem 1rem;
}
.table td > strong,
.table td > small {
  display: block;
}
.table td > small {
  color: #8b7d77;
}
.status-badge {
  display: inline-flex;
  padding: 0.25rem 0.55rem;
  border-radius: 2rem;
  background: #ece8e5;
  color: #675b57;
  font-size: 0.66rem;
  font-weight: 800;
  text-transform: uppercase;
}
.status-badge.active,
.status-badge.available,
.status-badge.confirmed {
  background: #d8ecdf;
  color: #27563c;
}
.status-badge.inactive,
.status-badge.expired,
.status-badge.cancelled {
  background: #f4d9d5;
  color: #8f332b;
}
.status-badge.pending,
.status-badge.reserved {
  background: #f7e9c9;
  color: #7b5b16;
}
.status-badge.used {
  background: #dce5f2;
  color: #365779;
}
.actions {
  white-space: nowrap;
}
.btn-icon {
  display: inline-grid;
  place-items: center;
  width: 2.15rem;
  height: 2.15rem;
  margin-left: 0.25rem;
  border-radius: 0.45rem;
  background: #f0ecea;
  color: #665853;
  transition: 0.2s;
}
.btn-icon:hover {
  transform: translateY(-1px);
}
.btn-icon.view {
  background: #e2edf5;
  color: #2d617f;
}
.btn-icon.codes {
  background: #eee6f5;
  color: #67467f;
}
.btn-icon.edit {
  background: #f8ebca;
  color: #816018;
}
.btn-icon.remove {
  background: #f5deda;
  color: #9b382e;
}
.btn-icon.restore {
  background: #dcecdf;
  color: #286344;
}
.empty-row {
  display: grid;
  justify-items: center;
  gap: 0.5rem;
  padding: 2rem;
  color: #978983;
  text-align: center;
}
.empty-row i {
  font-size: 1.5rem;
}
.campaign-grid,
.partner-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  padding: 1rem;
}
.campaign-card,
.partner-card {
  padding: 1.1rem;
  border: 1px solid var(--admin-line);
  border-radius: 0.7rem;
  background: #fdfbf9;
}
.campaign-head {
  display: flex;
  align-items: start;
  justify-content: space-between;
}
.campaign-logo,
.partner-logo {
  display: grid;
  place-items: center;
  width: 3rem;
  height: 3rem;
  overflow: hidden;
  border: 1px solid var(--admin-line);
  border-radius: 50%;
  background: #fff;
  color: var(--admin-dark);
  font-family: var(--font-title);
  font-size: 1.2rem;
}
.campaign-card > small {
  display: block;
  margin-top: 0.8rem;
  color: #8a7770;
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
}
.campaign-card h2,
.partner-card h2 {
  margin: 0.2rem 0;
  color: var(--admin-dark);
  font-size: 1.05rem;
}
.campaign-card > p,
.partner-card p {
  min-height: 2.6rem;
  color: #766762;
  font-size: 0.82rem;
}
.campaign-numbers {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-top: 0.9rem;
}
.campaign-numbers span {
  padding: 0.55rem;
  border-radius: 0.45rem;
  background: #fff;
}
.campaign-numbers small,
.campaign-numbers strong {
  display: block;
}
.campaign-numbers small {
  color: #93837d;
  font-size: 0.63rem;
}
.campaign-numbers strong {
  font-size: 0.78rem;
}
.campaign-progress {
  margin-top: 0.8rem;
}
.campaign-progress > span {
  display: block;
  height: 0.38rem;
  overflow: hidden;
  border-radius: 1rem;
  background: #e5ddda;
}
.campaign-progress i {
  display: block;
  height: 100%;
  background: #679079;
}
.campaign-progress small {
  color: #8c7d78;
}
.campaign-card footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.8rem;
  padding-top: 0.7rem;
  border-top: 1px solid var(--admin-line);
  color: #867670;
  font-size: 0.75rem;
}
.partner-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.partner-card {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.8rem;
}
.partner-logo {
  position: relative;
}
.partner-logo img {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #fff;
}
.partner-card footer {
  grid-column: 1/-1;
  text-align: right;
}
.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: #24171399;
  backdrop-filter: blur(3px);
}
.admin-modal {
  width: min(100%, 52rem);
  max-height: calc(100dvh - 2rem);
  overflow: auto;
  border-radius: 0.8rem;
  background: #fff;
  box-shadow: 0 24px 70px #1e15114d;
}
.admin-modal > header {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--admin-line);
  background: #fff;
}
.admin-modal header small {
  color: #8c7770;
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
}
.admin-modal h2 {
  margin: 0;
  color: var(--admin-dark);
  font-size: 1.35rem;
}
.admin-modal header button {
  font-size: 1.8rem;
  color: #766762;
}
.admin-modal form,
.reward-detail {
  padding: 1.25rem;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}
.form-field {
  display: grid;
  gap: 0.35rem;
}
.form-field.wide,
.wide {
  grid-column: 1/-1;
}
.form-field > span {
  color: #6f615c;
  font-size: 0.75rem;
  font-weight: 800;
}
.form-field input,
.form-field select,
.form-field textarea,
.codes-table select {
  width: 100%;
  padding: 0.65rem 0.75rem;
  border: 1px solid #d8cbc6;
  border-radius: 0.45rem;
  background: #fbf9f8;
  color: #382a25;
  outline: none;
}
.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  border-color: var(--admin-primary);
  box-shadow: 0 0 0 3px #5d40371f;
}
.switch-field {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 700;
}
.switch-field input {
  width: 1.1rem;
  height: 1.1rem;
  accent-color: var(--admin-primary);
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.7rem;
  padding-top: 0.5rem;
}
.admin-modal :deep(.modal-submit) {
  border-color: var(--admin-dark);
  background: var(--admin-primary);
  color: #fff;
  font-weight: 700;
  box-shadow: 0 4px 10px #442a2226;
}
.admin-modal :deep(.modal-submit:hover),
.admin-modal :deep(.modal-submit:focus) {
  border-color: var(--admin-dark);
  background: var(--admin-dark);
  color: #fff;
}
.admin-modal :deep(.modal-submit:disabled) {
  border-color: #927d75;
  background: #927d75;
  color: #fff;
  opacity: 0.72;
}
.codes-help {
  display: flex;
  gap: 0.6rem;
  margin-bottom: 1rem;
  padding: 0.8rem;
  border-radius: 0.5rem;
  background: #f9f0df;
  color: #72571e;
}
.codes-help p {
  margin: 0;
}
.detail-summary {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 1rem;
  align-items: center;
}
.detail-logo {
  display: grid;
  place-items: center;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: #efe3d9;
  color: #442a22;
  font-family: var(--font-title);
  font-size: 1.6rem;
}
.detail-summary h3 {
  margin: 0.1rem 0;
  color: #442a22;
}
.detail-summary p {
  margin: 0;
  color: #776762;
}
.detail-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.7rem;
  margin: 1.2rem 0;
}
.detail-stats span {
  padding: 0.8rem;
  border-radius: 0.5rem;
  background: #f6f2ef;
}
.detail-stats small,
.detail-stats strong {
  display: block;
}
.reward-detail h4 {
  font-size: 1rem;
}
.codes-table {
  display: grid;
  gap: 0.45rem;
}
.codes-table > div {
  display: grid;
  grid-template-columns: minmax(8rem, 1fr) auto minmax(8rem, 1fr) 9rem;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem;
  border: 1px solid var(--admin-line);
  border-radius: 0.45rem;
}
.codes-table code {
  color: #442a22;
  font-weight: 800;
}
.codes-table small {
  color: #887873;
}
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: 0.2s;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: translateY(0.4rem);
}
@media (max-width: 991px) {
  .partner-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 767px) {
  .page-heading {
    align-items: stretch;
    flex-direction: column;
  }
  .page-heading .btn {
    width: 100%;
  }
  .summary-row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin-inline: 0;
  }
  .summary-row > div {
    width: auto;
    padding-inline: 0.25rem;
  }
  .content-card > .card-header {
    align-items: flex-start;
    flex-direction: column;
  }
  .filter-select {
    width: 100%;
  }
  .campaign-grid,
  .partner-grid {
    grid-template-columns: 1fr;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
  .form-field.wide,
  .wide {
    grid-column: auto;
  }
  .admin-modal {
    align-self: end;
    max-height: 92dvh;
    border-radius: 0.9rem 0.9rem 0 0;
  }
  .modal-backdrop-custom {
    padding: 0;
  }
  .detail-summary {
    grid-template-columns: auto 1fr;
  }
  .detail-summary > .status-badge {
    grid-column: 1/-1;
    width: max-content;
  }
  .codes-table > div {
    grid-template-columns: 1fr auto;
  }
  .codes-table small {
    grid-column: 1/2;
  }
  .codes-table select {
    grid-column: 2/3;
    grid-row: 2;
  }
  .campaign-numbers {
    grid-template-columns: 1fr;
  }
  .table {
    min-width: 760px;
  }
}
@media (max-width: 390px) {
  .summary-row {
    grid-template-columns: 1fr;
  }
  .admin-tabs button {
    padding: 0.6rem 0.75rem;
  }
  .admin-tabs button i {
    display: none;
  }
}
</style>
