<template>
  <div class="settings-modal-overlay" @click.self="$emit('close')">
    <section class="settings-modal" aria-labelledby="email-modal-title" role="dialog" aria-modal="true">
      <button class="modal-close" type="button" aria-label="Fermer" @click="$emit('close')">
        <img src="/icons/x.svg" alt="" aria-hidden="true" />
      </button>

      <header class="modal-header">
        <span class="modal-icon" aria-hidden="true">
          <img src="/icons/mail.svg" alt="" />
        </span>
        <h3 id="email-modal-title">Modifier l'adresse mail</h3>
        <p>Confirmez votre mot de passe pour protéger l'accès au compte.</p>
      </header>

      <div v-if="successMessage" class="modal-alert success" role="status">
        <img src="/icons/check.svg" alt="" aria-hidden="true" />
        <span>{{ successMessage }}</span>
      </div>

      <form v-else class="modal-form" @submit.prevent="submitForm" novalidate>
        <p v-if="errors.general" class="modal-alert error" role="alert">{{ errors.general }}</p>

        <label class="modal-field" for="current-email">
          <span>Email actuel</span>
          <span class="modal-control readonly">
            <input id="current-email" type="email" :value="user?.email" disabled />
            <img src="/icons/mail-check.svg" alt="" aria-hidden="true" />
          </span>
        </label>

        <label class="modal-field" for="new-email">
          <span>Nouvel email</span>
          <span class="modal-control">
            <input id="new-email" v-model.trim="newEmail" type="email" autocomplete="email" />
            <img src="/icons/mail.svg" alt="" aria-hidden="true" />
          </span>
          <small v-if="errors.newEmail">{{ errors.newEmail }}</small>
        </label>

        <label class="modal-field" for="email-password">
          <span>Mot de passe</span>
          <span class="modal-control">
            <input id="email-password" v-model="password" type="password" autocomplete="current-password" />
            <img src="/icons/lock.svg" alt="" aria-hidden="true" />
          </span>
          <small v-if="errors.password">{{ errors.password }}</small>
        </label>

        <div class="modal-actions">
          <button type="button" class="secondary-action" @click="$emit('close')">Annuler</button>
          <button type="submit" class="primary-action">Valider</button>
        </div>
      </form>
    </section>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import axios from "@/axios.js";

export default {
  emits: ['close'],
  data() {
    return {
      newEmail: '',
      password: '',
      errors: {},
      successMessage: ''
    };
  },
  computed: {
    ...mapState({
      user: state => state.user
    })
  },
  methods: {
    async submitForm() {
      this.errors = {};
      try {
        const response = await axios.put('/api/settings/email', {
          newEmail: this.newEmail,
          password: this.password
        });

        if (response.data.success) {
          this.successMessage = response.data.message;
          this.$store.commit('setUser', {
            ...this.user,
            email: response.data.email
          });
          setTimeout(() => {
            this.$emit('close');
          }, 1600);
        }
      } catch (error) {
        if (error.response?.data?.errors) {
          for (const err of error.response.data.errors) {
            this.errors[err.field] = err.message;
          }
        } else {
          this.errors.general = "Une erreur est survenue.";
        }
      }
    }
  }
};
</script>

<style scoped>
.settings-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: grid;
  place-items: center;
  padding: 1.25rem;
  background: rgba(28, 28, 25, 0.42);
  backdrop-filter: blur(8px);
}

.settings-modal {
  position: relative;
  width: min(100%, 31rem);
  border: 1px solid rgba(212, 195, 190, 0.72);
  border-radius: 0.85rem;
  background: #fdf9f4;
  box-shadow: 0 24px 70px rgba(68, 42, 34, 0.22);
  padding: 1.4rem;
  color: #1c1c19;
}

.modal-close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  display: grid;
  place-items: center;
  width: 2.35rem;
  height: 2.35rem;
  border-radius: 999px;
  transition: background 0.2s ease, transform 0.2s ease;
}

.modal-close:hover {
  background: rgba(93, 64, 55, 0.08);
  transform: rotate(6deg);
}

.modal-close img,
.modal-icon img,
.modal-control img,
.modal-alert img {
  width: 1.1rem;
  height: 1.1rem;
}

.modal-header {
  display: grid;
  justify-items: center;
  gap: 0.55rem;
  padding: 0.4rem 2rem 1.25rem;
  text-align: center;
}

.modal-icon {
  display: grid;
  place-items: center;
  width: 3rem;
  height: 3rem;
  border-radius: 999px;
  background: #eee1c9;
}

.modal-header h3 {
  color: #442a22;
  font-size: 1.45rem;
}

.modal-header p {
  max-width: 22rem;
  color: #665852;
  font-size: 0.92rem;
  line-height: 1.45;
}

.modal-form {
  display: grid;
  gap: 1rem;
}

.modal-field {
  display: grid;
  gap: 0.4rem;
  color: #665852;
  font-weight: 800;
}

.modal-control {
  display: flex;
  align-items: center;
  min-height: 3rem;
  border: 1px solid rgba(212, 195, 190, 0.95);
  border-bottom-width: 2px;
  border-radius: 0.5rem 0.5rem 0 0;
  background: rgba(241, 237, 232, 0.76);
}

.modal-control.readonly {
  opacity: 0.76;
}

.modal-control input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  padding: 0.75rem 1rem;
  color: #1c1c19;
  font: inherit;
  font-weight: 800;
}

.modal-control img {
  margin: 0 0.9rem;
  opacity: 0.55;
}

.modal-field small,
.modal-alert.error {
  color: #ba1a1a;
  font-size: 0.82rem;
  font-weight: 800;
}

.modal-alert {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  border-radius: 0.55rem;
  padding: 0.85rem 1rem;
  font-weight: 800;
}

.modal-alert.success {
  background: #c8ead8;
  color: #18362a;
}

.modal-alert.error {
  background: rgba(255, 218, 214, 0.48);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 0.5rem;
}

.primary-action,
.secondary-action {
  min-height: 2.75rem;
  padding: 0.65rem 1.2rem;
  border-radius: 999px;
  font-weight: 900;
  transition: transform 0.2s ease, background 0.2s ease;
}

.primary-action {
  background: #442a22;
  color: #fff;
}

.secondary-action {
  border: 2px solid #5d4037;
  color: #5d4037;
}

.primary-action:hover,
.secondary-action:hover {
  transform: translateY(-1px);
}

@media (max-width: 520px) {
  .settings-modal-overlay {
    align-items: end;
    padding: 0;
  }

  .settings-modal {
    width: 100%;
    border-radius: 1rem 1rem 0 0;
    padding-bottom: calc(1.4rem + env(safe-area-inset-bottom));
  }

  .modal-actions {
    flex-direction: column-reverse;
  }
}
</style>
