<template>
  <section class="benefits-section" aria-labelledby="benefits-title">
    <header class="section-heading">
      <div>
        <span class="heading-icon"><img src="/icons/gift.svg" alt="" /></span>
        <div>
          <p>Votre portefeuille</p>
          <h2 id="benefits-title">Mes avantages</h2>
        </div>
      </div>
      <router-link :to="{ name: 'Recompenses' }">Découvrir</router-link>
    </header>

    <div v-if="loading" class="benefits-loading" aria-label="Chargement des avantages">
      <span></span><span></span>
    </div>

    <template v-else>
      <div class="benefit-tabs" role="tablist" aria-label="Avantages et historique">
        <button
          type="button"
          role="tab"
          :aria-selected="activeTab === 'active'"
          :class="{ active: activeTab === 'active' }"
          @click="activeTab = 'active'"
        >
          Coupons actifs <small>{{ activeCoupons.length }}</small>
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="activeTab === 'history'"
          :class="{ active: activeTab === 'history' }"
          @click="activeTab = 'history'"
        >
          Historique <small>{{ historyItems.length }}</small>
        </button>
      </div>

      <div v-if="activeTab === 'active'" class="coupon-list" role="tabpanel">
        <article v-for="coupon in activeCoupons" :key="coupon.id" class="active-coupon">
          <span class="partner-mark">
            <img v-if="coupon.reward?.partner?.logoUrl" :src="coupon.reward.partner.logoUrl" alt="" />
            <b v-else>{{ initialFor(coupon.reward?.partner?.name || coupon.reward?.name) }}</b>
          </span>
          <div class="coupon-details">
            <small>{{ coupon.reward?.partner?.name || 'Partenaire Pangeas' }}</small>
            <h3>{{ coupon.reward?.name || 'Coupon' }}</h3>
            <p v-if="coupon.couponCode?.expiresAt">Valable jusqu’au {{ formatDate(coupon.couponCode.expiresAt) }}</p>
            <p v-else>Disponible dans votre portefeuille</p>
          </div>
          <button class="copy-code" type="button" @click="copyCode(coupon.couponCode?.code)">
            <span>{{ copiedCode === coupon.couponCode?.code ? 'Copié !' : coupon.couponCode?.code }}</span>
            <img src="/icons/copy.svg" alt="Copier le code" />
          </button>
        </article>

        <div v-if="activeCoupons.length === 0" class="empty-benefits">
          <span aria-hidden="true">🎁</span>
          <strong>Aucun coupon actif</strong>
          <p>Vos prochains coupons apparaîtront ici, prêts à être utilisés.</p>
          <router-link :to="{ name: 'Recompenses' }">Voir les récompenses</router-link>
        </div>
      </div>

      <div v-else class="history-list" role="tabpanel">
        <article v-for="item in historyItems" :key="item.key" class="history-row">
          <span class="history-symbol" :class="item.type" aria-hidden="true">
            <img :src="item.type === 'donation' ? '/icons/heart.svg' : '/icons/gift.svg'" alt="" />
          </span>
          <div>
            <small>{{ item.type === 'donation' ? 'Don' : 'Coupon' }} · {{ formatDate(item.date) }}</small>
            <h3>{{ item.title }}</h3>
            <p>{{ item.subtitle }}</p>
          </div>
          <div class="history-meta">
            <b>{{ item.type === 'donation' ? `${formatCurrency(item.amount)}` : `−${formatNumber(item.points)} pts` }}</b>
            <span :class="`status-${item.status}`">{{ statusLabel(item) }}</span>
          </div>
        </article>

        <div v-if="historyItems.length === 0" class="empty-benefits compact">
          <strong>Aucune activité passée</strong>
          <p>Les coupons utilisés et vos dons seront regroupés ici.</p>
        </div>
      </div>

      <button v-if="loadError" class="retry-button" type="button" @click="$emit('retry')">
        Certaines données n’ont pas pu être chargées · Réessayer
      </button>
    </template>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  redemptions: { type: Array, default: () => [] },
  donations: { type: Array, default: () => [] },
  loading: Boolean,
  loadError: Boolean,
});

defineEmits(['retry']);

const activeTab = ref('active');
const copiedCode = ref('');
let copyTimer;

const activeCoupons = computed(() => props.redemptions.filter(redemption => {
  const coupon = redemption.couponCode;
  const expiresAt = coupon?.expiresAt ? new Date(coupon.expiresAt) : null;
  return ['pending', 'completed'].includes(redemption.status)
    && coupon?.status === 'reserved'
    && (!expiresAt || expiresAt > new Date());
}));

const historyItems = computed(() => {
  const coupons = props.redemptions
    .filter(redemption => !activeCoupons.value.some(active => active.id === redemption.id))
    .map(redemption => ({
      key: `coupon-${redemption.id}`,
      type: 'coupon',
      title: redemption.reward?.name || 'Coupon Pangeas',
      subtitle: redemption.reward?.partner?.name || 'Partenaire Pangeas',
      points: Number(redemption.pointsSpent) || 0,
      status: couponHistoryStatus(redemption),
      date: redemption.redeemedAt || redemption.createdAt,
    }));

  const donations = props.donations.map(donation => ({
    key: `donation-${donation.id}`,
    type: 'donation',
    title: donation.campaign?.name || 'Don partenaire',
    subtitle: donation.campaign?.partner?.name || 'Cause soutenue',
    amount: Number(donation.amount) || 0,
    status: donation.status,
    date: donation.confirmedAt || donation.createdAt,
  }));

  return [...coupons, ...donations].sort((a, b) => new Date(b.date) - new Date(a.date));
});

function initialFor(value) {
  return String(value || 'P').trim().charAt(0).toUpperCase();
}

function formatNumber(value) {
  return new Intl.NumberFormat('fr-FR').format(Number(value) || 0);
}

function formatCurrency(value) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
}

function statusLabel(item) {
  const labels = {
    used: 'Utilisé',
    expired: 'Expiré',
    cancelled: 'Annulé',
    refunded: 'Remboursé',
    confirmed: 'Confirmé',
    pending: 'En attente',
    completed: 'Obtenu',
  };
  return labels[item.status] || 'Terminé';
}

function couponHistoryStatus(redemption) {
  const coupon = redemption.couponCode;
  if (coupon?.expiresAt && new Date(coupon.expiresAt) <= new Date() && coupon.status !== 'used') return 'expired';
  return coupon?.status || redemption.status;
}

async function copyCode(code) {
  if (!code) return;
  try {
    await navigator.clipboard.writeText(code);
    copiedCode.value = code;
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => { copiedCode.value = ''; }, 1800);
  } catch {
    copiedCode.value = '';
  }
}
</script>

<style scoped>
.benefits-section {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  padding: 1.25rem;
  border: 1px solid rgba(205, 184, 176, 0.85);
  border-radius: 0.9rem;
  background: rgba(247, 243, 238, 0.88);
  box-shadow: var(--shadow-pangeas-card);
}

.section-heading,
.section-heading > div {
  display: flex;
  align-items: center;
}

.section-heading > div {
  min-width: 0;
}

.section-heading {
  justify-content: space-between;
  gap: 1rem;
}

.section-heading > div {
  gap: 0.75rem;
}

.heading-icon {
  display: grid;
  place-items: center;
  width: 2.65rem;
  height: 2.65rem;
  border-radius: 0.75rem;
  background: #e9d6ca;
}

.heading-icon img {
  width: 1.2rem;
}

.section-heading p {
  color: #8a6d62;
  font-size: 0.65rem;
  font-weight: 900;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.section-heading h2 {
  color: var(--color-pangeas-primary);
  font-size: 1.35rem;
}

.section-heading > a {
  color: var(--color-pangeas-primary);
  font-size: 0.78rem;
  font-weight: 900;
  text-decoration: underline;
  text-underline-offset: 0.2rem;
}

.benefit-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.3rem;
  margin-top: 1.15rem;
  padding: 0.25rem;
  border-radius: 0.7rem;
  background: #e9e0da;
}

.benefit-tabs button {
  min-width: 0;
}

.benefit-tabs button {
  min-height: 2.55rem;
  padding: 0.55rem;
  border-radius: 0.55rem;
  color: #725f57;
  font-size: 0.78rem;
  font-weight: 900;
}

.benefit-tabs button.active {
  background: #fffaf6;
  color: var(--color-pangeas-primary);
  box-shadow: 0 2px 8px rgba(68, 42, 34, 0.08);
}

.benefit-tabs small {
  display: inline-grid;
  place-items: center;
  min-width: 1.25rem;
  height: 1.25rem;
  margin-left: 0.2rem;
  border-radius: 99px;
  background: #d8c6bd;
  font-size: 0.66rem;
}

.benefit-tabs .active small {
  background: var(--color-pangeas-green);
  color: #264c3a;
}

.coupon-list,
.history-list {
  display: grid;
  gap: 0.75rem;
  margin-top: 0.85rem;
}

.active-coupon {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) minmax(0, auto);
  align-items: center;
  gap: 0.8rem;
  padding: 0.9rem;
  border: 1px solid #b9d5c6;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #edf6f1, #f9f5ef);
}

.partner-mark {
  display: grid;
  place-items: center;
  width: 3rem;
  height: 3rem;
  overflow: hidden;
  border: 1px solid #d9cec7;
  border-radius: 50%;
  background: #fff;
  color: var(--color-pangeas-primary);
  font-family: var(--font-title);
}

.partner-mark img {
  width: 75%;
  height: 75%;
  object-fit: contain;
}

.coupon-details {
  min-width: 0;
}

.coupon-details small,
.history-row small {
  color: #806e67;
  font-size: 0.65rem;
  font-weight: 900;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.coupon-details h3,
.history-row h3 {
  margin-top: 0.15rem;
  color: #38241e;
  font-size: 0.9rem;
  line-height: 1.3;
}

.coupon-details p,
.history-row p {
  margin-top: 0.15rem;
  color: #665852;
  font-size: 0.72rem;
}

.copy-code {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.6rem 0.7rem;
  border: 1px dashed #789b86;
  border-radius: 0.55rem;
  background: #fff;
  color: #315b47;
  font-family: monospace;
  font-size: 0.74rem;
  font-weight: 900;
  max-width: 12rem;
  min-width: 0;
}

.copy-code span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.copy-code img {
  width: 0.9rem;
}

.history-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.8rem 0;
  border-bottom: 1px solid #ded2cc;
}

.history-row:last-child {
  border-bottom: 0;
}

.history-symbol {
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.65rem;
  background: #eadbd3;
}

.history-symbol.donation {
  background: #dcece3;
}

.history-symbol img {
  width: 1.05rem;
}

.history-meta {
  display: grid;
  justify-items: end;
  gap: 0.25rem;
  color: var(--color-pangeas-primary);
  font-size: 0.72rem;
  white-space: nowrap;
}

.history-meta span {
  padding: 0.2rem 0.45rem;
  border-radius: 99px;
  background: #e4ddd9;
  color: #665852;
  font-size: 0.62rem;
  font-weight: 900;
}

.history-meta .status-confirmed,
.history-meta .status-used {
  background: #d6eadf;
  color: #24513d;
}

.history-meta .status-pending {
  background: #eee1c9;
  color: #705d32;
}

.empty-benefits {
  display: grid;
  justify-items: center;
  padding: 1.5rem 1rem;
  border: 1px dashed #cdb8b0;
  border-radius: 0.7rem;
  background: #fffaf6;
  color: #665852;
  text-align: center;
}

.empty-benefits > span {
  margin-bottom: 0.4rem;
  font-size: 1.45rem;
}

.empty-benefits strong {
  color: #442a22;
}

.empty-benefits p {
  max-width: 25rem;
  margin-top: 0.25rem;
  font-size: 0.78rem;
}

.empty-benefits a {
  margin-top: 0.65rem;
  color: #442a22;
  font-size: 0.78rem;
  font-weight: 900;
  text-decoration: underline;
}

.empty-benefits.compact {
  padding-block: 1rem;
}

.retry-button {
  width: 100%;
  margin-top: 0.75rem;
  color: #934b3c;
  font-size: 0.73rem;
  font-weight: 800;
}

.benefits-loading {
  display: grid;
  gap: 0.7rem;
  margin-top: 1rem;
}

.benefits-loading span {
  height: 4.75rem;
  border-radius: 0.7rem;
  background: linear-gradient(100deg, #ece4df 30%, #f8f4f1 50%, #ece4df 70%);
  background-size: 220%;
  animation: benefits-shimmer 1.3s infinite;
}

@keyframes benefits-shimmer {
  to { background-position: -220%; }
}

@media (max-width: 560px) {
  .benefits-section {
    padding: 1rem;
  }

  .active-coupon {
    grid-template-columns: auto 1fr;
  }

  .copy-code {
    grid-column: 1 / -1;
    justify-content: space-between;
    width: 100%;
    max-width: 100%;
  }

  .history-row {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .history-meta {
    grid-column: 2;
    grid-row: 2;
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }
}

@media (max-width: 360px) {
  .section-heading {
    align-items: flex-start;
  }

  .section-heading > a {
    font-size: 0.7rem;
  }

  .benefit-tabs button {
    padding-inline: 0.25rem;
    font-size: 0.7rem;
  }
}
</style>
