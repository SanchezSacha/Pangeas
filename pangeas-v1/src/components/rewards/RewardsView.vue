<template>
  <main class="rewards-page">
    <header class="rewards-topbar">
      <div class="topbar-brand">
        <picture>
          <source media="(min-width: 768px)" srcset="/logo_marron_2.png" />
          <img src="/logo_mobile_pangeas.png" alt="PANGEAS" />
        </picture>
        <h1>Récompenses</h1>
      </div>
      <button class="topbar-back" type="button" aria-label="Retour" @click="goBack">
        <img src="/icons/arrow-left.svg" alt="" />
      </button>
      <nav class="desktop-nav" aria-label="Navigation principale">
        <router-link :to="{ name: 'Home' }">Explorer</router-link>
        <router-link :to="{ name: 'MonCompte' }">Favoris</router-link>
        <router-link class="active" :to="{ name: 'Recompenses' }">Récompenses</router-link>
        <router-link :to="{ name: 'Parametres' }">Paramètres</router-link>
      </nav>
    </header>

    <div class="rewards-content">
      <section class="points-card" aria-labelledby="points-label">
        <img src="/icons/badge-check.svg" alt="" />
        <p id="points-label">Points d’exploration</p>
        <strong v-if="!loadingSummary">
          {{ formatNumber(availablePoints) }}
          <small>pts</small>
        </strong>
        <span v-else class="points-skeleton" aria-label="Chargement du solde"></span>
        <span>Solde disponible</span>
      </section>

      <div class="tabs" role="tablist" aria-label="Types de récompenses">
        <button
          id="tab-coupons"
          type="button"
          role="tab"
          :aria-selected="activeTab === 'coupons'"
          :class="{ active: activeTab === 'coupons' }"
          @click="activeTab = 'coupons'"
        >
          Coupons
        </button>
        <button
          id="tab-donations"
          type="button"
          role="tab"
          :aria-selected="activeTab === 'donations'"
          :class="{ active: activeTab === 'donations' }"
          @click="activeTab = 'donations'"
        >
          Dons
        </button>
      </div>

      <section v-if="activeTab === 'coupons'" role="tabpanel" aria-labelledby="tab-coupons">
        <div v-if="redemptions.length" class="wallet">
          <button class="wallet-toggle" type="button" :aria-expanded="showWallet" @click="showWallet = !showWallet">
            <span>
              <img src="/icons/gift.svg" alt="" />
              Mes coupons
              <small>{{ redemptions.length }}</small>
            </span>
            <b aria-hidden="true">{{ showWallet ? '−' : '+' }}</b>
          </button>
          <div v-if="showWallet" class="wallet-list">
            <article v-for="item in redemptions" :key="item.id" class="wallet-card">
              <div>
                <small>{{ item.reward?.partner?.name || 'Pangeas' }}</small>
                <strong>{{ item.reward?.name || 'Coupon' }}</strong>
              </div>
              <button type="button" @click="copyCode(item.couponCode?.code)">
                <span>{{ item.couponCode?.code || 'Code indisponible' }}</span>
                <img src="/icons/copy.svg" alt="Copier" />
              </button>
            </article>
          </div>
        </div>

        <div v-if="loadingRewards" class="card-grid" aria-label="Chargement des coupons">
          <div v-for="index in 4" :key="index" class="coupon-offer skeleton"></div>
        </div>
        <div v-else-if="rewards.length" class="card-grid">
          <article v-for="reward in rewards" :key="reward.id" class="coupon-offer">
            <div class="reward-visual">
              <img
                v-if="reward.imageUrl && !brokenImages[`reward-${reward.id}`]"
                :src="reward.imageUrl"
                :alt="reward.name"
                @error="markImageBroken(`reward-${reward.id}`)"
              />
              <span v-else class="initial">{{ initialFor(reward.partner?.name || reward.name) }}</span>
              <span v-if="reward.scope" class="pill">{{ reward.scope }}</span>
            </div>
            <div class="reward-body">
              <p class="eyebrow">{{ reward.partner?.name || 'Partenaire Pangeas' }}</p>
              <h2>{{ reward.name }}</h2>
              <p class="description">
                {{ reward.description || reward.terms || 'Une offre réservée aux explorateurs Pangeas.' }}
              </p>
              <p v-if="reward.discountPercent" class="benefit">
                −{{ reward.discountPercent }} %
                <template v-if="reward.minimumPurchase">
                  dès {{ formatCurrency(reward.minimumPurchase) }} d’achat
                </template>
              </p>
              <div class="card-footer">
                <span class="cost">
                  <img src="/icons/badge-check.svg" alt="" />
                  {{ formatNumber(reward.pointsCost) }} pts
                </span>
                <button
                  class="primary-action"
                  type="button"
                  :disabled="!canRedeemReward(reward) || pendingAction"
                  @click="dialog = { type: 'reward', item: reward }"
                >
                  {{ rewardButtonLabel(reward) }}
                </button>
              </div>
              <small v-if="stockFor(reward) > 0 && stockFor(reward) <= 5" class="low-stock">
                Plus que {{ stockFor(reward) }} disponible{{ stockFor(reward) > 1 ? 's' : '' }}
              </small>
            </div>
          </article>
        </div>
        <EmptyState
          v-else
          title="Aucun coupon pour le moment"
          text="De nouvelles offres arrivent régulièrement. Revenez bientôt."
          :retry="loadError"
          @retry="loadRewards"
        />
      </section>

      <section v-else role="tabpanel" aria-labelledby="tab-donations">
        <div class="donation-info">
          <b aria-hidden="true">i</b>
          <p>Transformez vos points en dons de 5, 10 ou 25 €, financés par les partenaires Pangeas.</p>
        </div>
        <div v-if="loadingCampaigns" class="card-grid" aria-label="Chargement des campagnes">
          <div v-for="index in 4" :key="index" class="donation-card skeleton"></div>
        </div>
        <div v-else-if="campaigns.length" class="card-grid donation-grid">
          <article v-for="campaign in campaigns" :key="campaign.id" class="donation-card">
            <div class="donation-logo">
              <img
                v-if="campaign.partner?.logoUrl && !brokenImages[`campaign-${campaign.id}`]"
                :src="campaign.partner.logoUrl"
                :alt="campaign.partner.name"
                @error="markImageBroken(`campaign-${campaign.id}`)"
              />
              <span v-else>{{ initialFor(campaign.partner?.name || campaign.name) }}</span>
            </div>
            <p class="eyebrow">{{ campaign.partner?.name || 'Partenaire Pangeas' }}</p>
            <h2>{{ campaign.name }}</h2>
            <p class="description">{{ campaign.description || 'Soutenez cette cause grâce à vos explorations.' }}</p>
            <div v-if="campaign.goalAmount" class="campaign-progress">
              <div>
                <span>{{ formatCurrency(campaign.currentAmount) }} collectés</span>
                <span>{{ progressFor(campaign) }} %</span>
              </div>
              <span><i :style="{ width: `${progressFor(campaign)}%` }"></i></span>
            </div>
            <div class="card-footer">
              <span class="cost">
                <img src="/icons/badge-check.svg" alt="" />
                dès {{ formatNumber(pointsFor(campaign, 5)) }} pts
              </span>
              <button
                class="primary-action"
                type="button"
                :disabled="!canStartDonation(campaign) || pendingAction"
                @click="openDonation(campaign)"
              >
                {{ canStartDonation(campaign) ? 'Faire un don' : 'Indisponible' }}
              </button>
            </div>
          </article>
        </div>
        <EmptyState
          v-else
          title="Aucune campagne active"
          text="Les prochaines causes soutenues par Pangeas apparaîtront ici."
          :retry="loadError"
          @retry="loadCampaigns"
        />
      </section>
    </div>

    <transition name="fade">
      <div v-if="dialog" class="dialog-backdrop" @click.self="closeDialog">
        <section class="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
          <button class="dialog-close" type="button" aria-label="Fermer" @click="closeDialog">×</button>
          <template v-if="dialog.type === 'reward'">
            <span class="dialog-icon"><img src="/icons/gift.svg" alt="" /></span>
            <p class="eyebrow">Échanger mes points</p>
            <h2 id="dialog-title">{{ dialog.item.name }}</h2>
            <p>
              Vous allez utiliser
              <strong>{{ formatNumber(dialog.item.pointsCost) }} points</strong>
              . Votre code sera conservé dans « Mes coupons ».
            </p>
            <div class="balance">
              <span>Nouveau solde</span>
              <strong>{{ formatNumber(availablePoints - dialog.item.pointsCost) }} pts</strong>
            </div>
            <button
              class="dialog-confirm primary-action"
              type="button"
              :disabled="pendingAction"
              @click="redeemReward(dialog.item)"
            >
              {{ pendingAction ? 'Échange en cours…' : 'Confirmer l’échange' }}
            </button>
          </template>
          <template v-else-if="dialog.type === 'donation'">
            <span class="dialog-icon heart">♡</span>
            <p class="eyebrow">Soutenir une cause</p>
            <h2 id="dialog-title">{{ dialog.item.name }}</h2>
            <p>Choisissez le montant financé par le partenaire.</p>
            <div class="amounts" role="radiogroup" aria-label="Montant du don">
              <button
                v-for="amount in donationAmounts"
                :key="amount"
                type="button"
                role="radio"
                :aria-checked="selectedAmount === amount"
                :class="{ selected: selectedAmount === amount }"
                :disabled="!canDonateAmount(dialog.item, amount)"
                @click="selectedAmount = amount"
              >
                <strong>{{ amount }} €</strong>
                <small>{{ formatNumber(pointsFor(dialog.item, amount)) }} pts</small>
              </button>
            </div>
            <div class="balance">
              <span>Nouveau solde</span>
              <strong>{{ formatNumber(availablePoints - pointsFor(dialog.item, selectedAmount)) }} pts</strong>
            </div>
            <button
              class="dialog-confirm primary-action"
              type="button"
              :disabled="pendingAction || !canDonateAmount(dialog.item, selectedAmount)"
              @click="redeemDonation(dialog.item)"
            >
              {{ pendingAction ? 'Don en cours…' : `Confirmer le don de ${selectedAmount} €` }}
            </button>
          </template>
          <template v-else>
            <span class="dialog-icon success">✓</span>
            <p class="eyebrow">{{ dialog.kind === 'reward' ? 'Coupon obtenu' : 'Merci !' }}</p>
            <h2 id="dialog-title">{{ dialog.title }}</h2>
            <p>{{ dialog.message }}</p>
            <button v-if="dialog.code" class="code-copy" type="button" @click="copyCode(dialog.code)">
              <span>{{ dialog.code }}</span>
              <img src="/icons/copy.svg" alt="Copier" />
            </button>
            <button class="dialog-confirm primary-action" type="button" @click="closeDialog">Terminer</button>
          </template>
        </section>
      </div>
    </transition>
    <transition name="toast">
      <div v-if="toast" class="toast-message" role="status">{{ toast }}</div>
    </transition>
  </main>
</template>

<script setup>
import { computed, defineComponent, h, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/axios.js';

const EmptyState = defineComponent({
  props: { title: String, text: String, retry: Boolean },
  emits: ['retry'],
  setup(props, { emit }) {
    return () =>
      h('div', { class: 'empty-state' }, [
        h('img', { src: '/icons/gift.svg', alt: '' }),
        h('h2', props.title),
        h('p', props.text),
        props.retry ? h('button', { onClick: () => emit('retry') }, 'Réessayer') : null,
      ]);
  },
});
const router = useRouter();
const activeTab = ref('coupons');
const summary = ref(null),
  rewards = ref([]),
  campaigns = ref([]),
  redemptions = ref([]);
const loadingSummary = ref(true),
  loadingRewards = ref(true),
  loadingCampaigns = ref(true);
const loadError = ref(false),
  pendingAction = ref(false),
  showWallet = ref(false);
const dialog = ref(null),
  selectedAmount = ref(5),
  toast = ref(''),
  brokenImages = ref({});
const donationAmounts = [5, 10, 25];
let toastTimer;
const availablePoints = computed(() => Number(summary.value?.availablePoints) || 0);

function goBack() {
  window.history.length > 1 ? router.back() : router.push({ name: 'Home' });
}
function formatNumber(value) {
  return new Intl.NumberFormat('fr-FR').format(Number(value) || 0);
}
function formatCurrency(value) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(
    Number(value) || 0,
  );
}
function initialFor(value) {
  return String(value || 'P')
    .trim()
    .charAt(0)
    .toUpperCase();
}
function stockFor(reward) {
  return Number(reward?._count?.couponCodes) || 0;
}
function pointsFor(campaign, amount) {
  return (Number(campaign?.pointsPerEuro) || 400) * amount;
}
function progressFor(campaign) {
  return campaign.goalAmount
    ? Math.min(100, Math.round((Number(campaign.currentAmount) / Number(campaign.goalAmount)) * 100))
    : 0;
}
function canRedeemReward(reward) {
  return stockFor(reward) > 0 && availablePoints.value >= Number(reward.pointsCost);
}
function rewardButtonLabel(reward) {
  return stockFor(reward) <= 0
    ? 'Épuisé'
    : availablePoints.value < Number(reward.pointsCost)
      ? 'Points insuffisants'
      : 'Obtenir';
}
function remainingBudget(campaign) {
  return campaign.budgetAmount == null
    ? Infinity
    : Math.max(0, Number(campaign.budgetAmount) - Number(campaign.currentAmount));
}
function canDonateAmount(campaign, amount) {
  return remainingBudget(campaign) >= amount && availablePoints.value >= pointsFor(campaign, amount);
}
function canStartDonation(campaign) {
  return donationAmounts.some((amount) => canDonateAmount(campaign, amount));
}
function markImageBroken(key) {
  brokenImages.value = { ...brokenImages.value, [key]: true };
}
function makeKey(prefix) {
  return `${prefix}-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
}
function notify(message) {
  toast.value = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.value = '';
  }, 3200);
}
function readableError(error) {
  const messages = {
    INSUFFICIENT_POINTS: 'Votre solde de points est insuffisant.',
    OUT_OF_STOCK: 'Ce coupon vient d’être réservé.',
    USER_LIMIT_REACHED: 'Vous avez atteint la limite pour cette offre.',
    BUDGET_EXHAUSTED: 'Le budget partenaire est épuisé.',
    CAMPAIGN_UNAVAILABLE: 'Cette campagne n’est plus disponible.',
    REWARD_UNAVAILABLE: 'Cette récompense n’est plus disponible.',
  };
  return (
    messages[error.response?.data?.code] ||
    error.response?.data?.message ||
    'Une erreur est survenue. Veuillez réessayer.'
  );
}
async function loadSummary() {
  loadingSummary.value = true;
  try {
    summary.value = (await axios.get('/api/points/summary')).data.summary;
  } catch {
    loadError.value = true;
  } finally {
    loadingSummary.value = false;
  }
}
async function loadRewards() {
  loadingRewards.value = true;
  try {
    const [catalog, wallet] = await Promise.all([axios.get('/api/rewards'), axios.get('/api/rewards/mine')]);
    rewards.value = catalog.data.rewards || [];
    redemptions.value = wallet.data.redemptions || [];
  } catch {
    loadError.value = true;
  } finally {
    loadingRewards.value = false;
  }
}
async function loadCampaigns() {
  loadingCampaigns.value = true;
  try {
    campaigns.value = (await axios.get('/api/donations/campaigns')).data.campaigns || [];
  } catch {
    loadError.value = true;
  } finally {
    loadingCampaigns.value = false;
  }
}
function openDonation(campaign) {
  selectedAmount.value = donationAmounts.find((amount) => canDonateAmount(campaign, amount)) || 5;
  dialog.value = { type: 'donation', item: campaign };
}
function closeDialog() {
  if (!pendingAction.value) dialog.value = null;
}
async function redeemReward(reward) {
  pendingAction.value = true;
  try {
    const { data } = await axios.post(
      `/api/rewards/${reward.id}/redeem`,
      {},
      { headers: { 'Idempotency-Key': makeKey('coupon') } },
    );
    dialog.value = {
      type: 'success',
      kind: 'reward',
      title: reward.name,
      message: 'Votre coupon est prêt et restera accessible dans « Mes coupons ».',
      code: data.redemption?.couponCode?.code,
    };
    await Promise.all([loadSummary(), loadRewards()]);
    showWallet.value = true;
  } catch (error) {
    dialog.value = null;
    notify(readableError(error));
    await Promise.all([loadSummary(), loadRewards()]);
  } finally {
    pendingAction.value = false;
  }
}
async function redeemDonation(campaign) {
  pendingAction.value = true;
  const amount = selectedAmount.value;
  try {
    await axios.post(
      `/api/donations/campaigns/${campaign.id}/redeem`,
      { amount },
      { headers: { 'Idempotency-Key': makeKey('donation') } },
    );
    dialog.value = {
      type: 'success',
      kind: 'donation',
      title: `${amount} € pour ${campaign.name}`,
      message: 'Votre demande de don a bien été transmise. Elle sera confirmée après validation.',
    };
    await Promise.all([loadSummary(), loadCampaigns()]);
  } catch (error) {
    dialog.value = null;
    notify(readableError(error));
    await Promise.all([loadSummary(), loadCampaigns()]);
  } finally {
    pendingAction.value = false;
  }
}
async function copyCode(code) {
  if (!code) return;
  try {
    await navigator.clipboard.writeText(code);
    notify('Code copié dans le presse-papiers.');
  } catch {
    notify(`Code : ${code}`);
  }
}
onMounted(() => Promise.all([loadSummary(), loadRewards(), loadCampaigns()]));
</script>

<style scoped>
.rewards-page {
  min-height: 100vh;
  padding: 7.9rem 1rem 2rem;
  background: var(--color-pangeas-bg);
  color: #2f211c;
}
.rewards-topbar {
  position: fixed;
  inset: 0 0 auto;
  z-index: 30;
  display: flex;
  align-items: center;
  min-height: 7rem;
  padding: 0.9rem 1.25rem;
  border-bottom: 1px solid #d4c3be73;
  background: #fdf9f4f0;
  backdrop-filter: blur(14px);
}
.topbar-brand {
  position: absolute;
  left: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translateX(-50%);
}
.topbar-brand img {
  width: 5.7rem;
  opacity: 0.62;
}
.topbar-brand h1 {
  margin-top: -0.25rem;
  color: var(--color-pangeas-primary);
  font-size: 1.1rem;
}
.topbar-back {
  display: grid;
  place-items: center;
  width: 2.6rem;
  height: 2.6rem;
  margin-right: auto;
  border-radius: 50%;
}
.topbar-back:hover {
  background: #442a2212;
}
.topbar-back img {
  width: 1.25rem;
}
.desktop-nav {
  display: none;
  margin-left: auto;
  gap: 1.6rem;
}
.desktop-nav a {
  padding: 0.45rem 0;
  color: var(--color-pangeas-muted);
  font-size: 0.84rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-decoration: none;
  text-transform: uppercase;
}
.desktop-nav a.active {
  color: var(--color-pangeas-primary);
  border-bottom: 2px solid;
}
.rewards-content {
  width: min(100%, 72rem);
  margin: auto;
}
.points-card {
  display: grid;
  justify-items: center;
  min-height: 12.2rem;
  padding: 2rem 1.5rem;
  border: 1px solid #351f1924;
  border-radius: 1rem;
  background: linear-gradient(135deg, #54372e, #79574d 52%, #614238);
  box-shadow: 0 12px 24px #442a2229;
  color: #f9eee7;
  text-align: center;
}
.points-card > img {
  width: 1.6rem;
  filter: brightness(0) saturate(100%) invert(82%) sepia(16%);
  opacity: 0.85;
}
.points-card p {
  margin-top: 0.45rem;
  color: #dec0b5;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}
.points-card strong {
  margin-top: 0.35rem;
  font-family: var(--font-logo);
  font-size: clamp(2.7rem, 12vw, 4rem);
  line-height: 1;
}
.points-card strong small {
  font-family: var(--font-content);
  font-size: 0.9rem;
  font-weight: 400;
}
.points-card > span:last-child {
  margin-top: 0.55rem;
  color: #f9eee7b3;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.points-skeleton {
  width: 10rem;
  height: 3.5rem;
  margin-top: 0.45rem;
  border-radius: 0.5rem;
  background: #ffffff1f;
  animation: pulse 1.3s infinite;
}
.tabs {
  display: flex;
  gap: 1.6rem;
  margin-top: 1.8rem;
  border-bottom: 1px solid #442a2224;
}
.tabs button {
  position: relative;
  padding: 0.75rem 0.2rem 0.85rem;
  color: #665852;
  font-weight: 700;
}
.tabs button.active {
  color: #2f211c;
}
.tabs button.active:after {
  position: absolute;
  right: 0;
  bottom: -1px;
  left: 0;
  height: 2px;
  border-radius: 1rem;
  background: #442a22;
  content: '';
}
.wallet {
  margin-top: 1.3rem;
  overflow: hidden;
  border: 1px solid var(--color-pangeas-line);
  border-radius: 0.8rem;
  background: #fffaf6;
}
.wallet-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.9rem 1rem;
  color: #442a22;
  font-weight: 900;
}
.wallet-toggle span {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}
.wallet-toggle img {
  width: 1.15rem;
}
.wallet-toggle small {
  display: grid;
  place-items: center;
  min-width: 1.4rem;
  height: 1.4rem;
  border-radius: 50%;
  background: #eee1c9;
}
.wallet-list {
  display: grid;
  gap: 0.7rem;
  padding: 0 0.8rem 0.8rem;
}
.wallet-card {
  display: grid;
  gap: 0.65rem;
  padding: 0.9rem;
  border-radius: 0.65rem;
  background: #f7f3ee;
}
.wallet-card > div {
  display: grid;
}
.wallet-card small,
.description {
  color: #665852;
}
.wallet-card button,
.code-copy {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  padding: 0.7rem 0.8rem;
  border: 1px dashed #8d6f65;
  border-radius: 0.5rem;
  background: #fff;
  color: #442a22;
  font-family: monospace;
  font-weight: 900;
  letter-spacing: 0.08em;
}
.wallet-card button img,
.code-copy img {
  width: 1rem;
}
.card-grid {
  display: grid;
  gap: 1rem;
  margin-top: 1.25rem;
}
.coupon-offer,
.donation-card {
  overflow: hidden;
  border: 1px solid var(--color-pangeas-line);
  border-radius: 0.85rem;
  background: var(--color-pangeas-surface);
  box-shadow: 0 2px 5px #442a2208;
}
.reward-visual {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 8rem;
  padding: 1.2rem;
  background: #efebe6;
}
.reward-visual > img {
  width: 100%;
  height: 7rem;
  object-fit: contain;
}
.initial,
.donation-logo {
  display: grid;
  place-items: center;
  width: 4.5rem;
  height: 4.5rem;
  border: 1px solid #442a221f;
  border-radius: 50%;
  background: #fffaf6;
  color: #442a22;
  font-family: var(--font-logo);
  font-size: 2rem;
}
.pill {
  position: absolute;
  top: 0.65rem;
  right: 0.65rem;
  max-width: 60%;
  padding: 0.28rem 0.55rem;
  overflow: hidden;
  border-radius: 2rem;
  background: #d6eadf;
  color: #244f3c;
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 0.05em;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}
.reward-body,
.donation-card {
  padding: 1.05rem;
}
.eyebrow {
  margin-bottom: 0.3rem;
  color: #806e67;
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.coupon-offer h2,
.donation-card h2,
.dialog h2 {
  color: #38241e;
  font-family: var(--font-title);
  font-size: 1.08rem;
}
.description {
  margin-top: 0.4rem;
  font-size: 0.88rem;
  line-height: 1.5;
}
.benefit {
  margin-top: 0.35rem;
  font-size: 0.85rem;
  font-style: italic;
}
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 1.15rem;
}
.cost {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  flex: 1;
  font-size: 0.86rem;
  white-space: nowrap;
}
.cost img {
  width: 1rem;
}
.primary-action {
  min-height: 2.55rem;
  padding: 0.65rem 1rem;
  border: 1px solid #301812;
  border-radius: 0.5rem;
  background-color: #4b2b22;
  color: #fff;
  font-size: 0.78rem;
  font-weight: 800;
}
.primary-action:disabled {
  border-color: #c8bbb6;
  background: #d9d1cd;
  color: #7a6d68;
  cursor: not-allowed;
}
.low-stock {
  display: block;
  margin-top: 0.55rem;
  color: #9a4a32;
  font-weight: 700;
  text-align: right;
}
.donation-info {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.3rem;
  padding: 0.9rem;
  border: 1px solid #e6d5b8;
  border-radius: 0.7rem;
  background: #fbf5e9;
  color: #5f5547;
}
.donation-info b {
  display: grid;
  place-items: center;
  flex: 0 0 1.35rem;
  height: 1.35rem;
  border: 2px solid;
  border-radius: 50%;
  font-family: serif;
}
.donation-info p {
  font-size: 0.83rem;
  line-height: 1.45;
}
.donation-card {
  display: grid;
}
.donation-logo {
  width: 3.5rem;
  height: 3.5rem;
  margin-bottom: 0.8rem;
  font-size: 1.5rem;
}
.donation-logo img {
  width: 75%;
  height: 75%;
  object-fit: contain;
}
.campaign-progress {
  display: grid;
  gap: 0.35rem;
  margin-top: 1.1rem;
}
.campaign-progress > div {
  display: flex;
  justify-content: space-between;
  color: #806e67;
  font-size: 0.7rem;
  font-weight: 700;
}
.campaign-progress > span {
  height: 0.35rem;
  overflow: hidden;
  border-radius: 1rem;
  background: #ded5d0;
}
.campaign-progress i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: #789b86;
}
.empty-state {
  display: grid;
  justify-items: center;
  padding: 4rem 1.5rem;
  color: #665852;
  text-align: center;
}
.empty-state img {
  width: 2.5rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}
.empty-state h2 {
  color: #442a22;
  font-size: 1.2rem;
}
.empty-state p {
  max-width: 24rem;
  margin-top: 0.5rem;
}
.empty-state button {
  margin-top: 1rem;
  color: #442a22;
  font-weight: 900;
  text-decoration: underline;
}
.skeleton {
  min-height: 18rem;
  border-color: transparent;
  background: linear-gradient(100deg, #f1ece8 30%, #faf7f4 50%, #f1ece8 70%);
  background-size: 220%;
  animation: shimmer 1.4s infinite;
}
.dialog-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: grid;
  place-items: end center;
  padding: 1rem;
  background: #1d131080;
  backdrop-filter: blur(3px);
}
.dialog {
  position: relative;
  width: min(100%, 31rem);
  max-height: calc(100dvh - 2rem);
  padding: 1.6rem;
  overflow: auto;
  border-radius: 1.1rem;
  background: #fdf9f4;
  box-shadow: 0 22px 70px #211a1647;
  text-align: center;
}
.dialog-close {
  position: absolute;
  top: 0.6rem;
  right: 0.8rem;
  color: #665852;
  font-size: 1.8rem;
}
.dialog-icon {
  display: grid;
  place-items: center;
  width: 3.2rem;
  height: 3.2rem;
  margin: 0 auto 0.8rem;
  border-radius: 50%;
  background: #efe3d9;
  color: #5d4037;
}
.dialog-icon img {
  width: 1.35rem;
}
.dialog > .eyebrow {
  margin: 0;
}
.dialog h2 {
  margin-top: 0.25rem;
  font-size: 1.35rem;
}
.dialog > p:not(.eyebrow) {
  margin-top: 0.65rem;
  color: #665852;
  line-height: 1.55;
}
.balance {
  display: flex;
  justify-content: space-between;
  margin-top: 1.2rem;
  padding: 0.85rem;
  border-radius: 0.65rem;
  background: #f1ede8;
}
.dialog-confirm {
  width: 100%;
  margin-top: 1rem;
}
.success {
  background: #d6eadf;
  color: #24513d;
  font-weight: 900;
}
.heart {
  font-family: serif;
  font-size: 2rem;
}
.code-copy {
  width: 100%;
  margin-top: 1rem;
}
.amounts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-top: 1rem;
}
.amounts button {
  display: grid;
  gap: 0.15rem;
  padding: 0.75rem 0.25rem;
  border: 1px solid #d4c3be;
  border-radius: 0.65rem;
  background: #fffaf6;
  color: #38241e;
}
.amounts button.selected {
  border-color: #5d4037;
  background: #5d4037;
  color: #fff;
}
.amounts button:disabled {
  opacity: 0.38;
  cursor: not-allowed;
}
.amounts small {
  font-size: 0.67rem;
}
.toast-message {
  position: fixed;
  right: 1rem;
  bottom: calc(5.6rem + env(safe-area-inset-bottom));
  left: 1rem;
  z-index: 1300;
  width: fit-content;
  max-width: calc(100% - 2rem);
  margin: auto;
  padding: 0.8rem 1rem;
  border-radius: 2rem;
  background: #2f211c;
  color: #fff;
  font-size: 0.82rem;
  font-weight: 700;
  text-align: center;
}
.fade-enter-active,
.fade-leave-active,
.toast-enter-active,
.toast-leave-active {
  transition: 0.2s;
}
.fade-enter-from,
.fade-leave-to,
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(0.5rem);
}
@keyframes pulse {
  50% {
    opacity: 0.5;
  }
}
@keyframes shimmer {
  to {
    background-position: -220%;
  }
}
@media (min-width: 640px) {
  .card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .wallet-card {
    grid-template-columns: 1fr minmax(12rem, 0.8fr);
    align-items: center;
  }
}
@media (min-width: 768px) {
  .rewards-page {
    padding: 8.75rem 4rem 4rem;
  }
  .rewards-topbar {
    padding-inline: 4rem;
  }
  .topbar-back {
    display: none;
  }
  .desktop-nav {
    display: flex;
  }
  .topbar-brand img {
    width: 10.25rem;
    opacity: 0.86;
  }
  .topbar-brand h1 {
    margin-top: 0.15rem;
  }
  .points-card {
    min-height: 14rem;
    padding-block: 2.5rem;
  }
  .dialog-backdrop {
    place-items: center;
  }
  .toast-message {
    bottom: 1.5rem;
  }
}
@media (min-width: 1040px) {
  .card-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .donation-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 380px) {
  .rewards-page {
    padding-inline: 0.75rem;
  }
  .card-footer {
    align-items: stretch;
    flex-direction: column;
  }
  .primary-action {
    width: 100%;
  }
  .low-stock {
    text-align: left;
  }
}
</style>
