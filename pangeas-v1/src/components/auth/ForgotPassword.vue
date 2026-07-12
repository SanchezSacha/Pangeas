<template>
  <main class="auth-page">
    <section class="auth-panel">
      <h1 class="form-title">Mot de passe oublie</h1>
      <p class="auth-text">
        Indiquez l'adresse mail de votre compte. Si elle existe, un lien de reinitialisation vous sera envoyé.
      </p>

      <form class="form-container" @submit.prevent="submitForm" novalidate>
        <div class="input-duo">
          <div class="input-group">
            <span class="input-group-text">
              <img src="/icons/mail.svg" alt="Mail" style="width: 18px;" />
            </span>
            <input type="email" class="form-control" placeholder="Adresse mail *" v-model.trim="email" required/>
          </div>
          <p class="text-error" v-if="errors.email">{{ errors.email }}</p>
          <p class="text-error" v-if="errors.general">{{ errors.general }}</p>
          <p class="success-message" v-if="successMessage">{{ successMessage }}</p>
        </div>

        <button type="submit" class="submit-btn" :disabled="isSubmitting">
          {{ isSubmitting ? 'Envoi en cours...' : 'Envoyer le lien' }}
        </button>
      </form>

      <router-link class="auth-link" :to="{ name: 'Home' }">Retour a l'accueil</router-link>
    </section>
  </main>
</template>

<script>
import axios from "@/axios.js";

export default {
  name: "ForgotPassword",
  data() {
    return {
      email: "",
      errors: {},
      successMessage: "",
      isSubmitting: false
    };
  },
  methods: {
    async submitForm() {
      this.errors = {};
      this.successMessage = "";

      if (!this.email) {
        this.errors = { email: "L'adresse mail est obligatoire." };
        return;
      }

      this.isSubmitting = true;

      try {
        await axios.post(
            "/api/auth/forgot-password",
            { email: this.email },
            { headers: { "Content-Type": "application/json" } }
        );

        this.email = "";
        this.successMessage = "Si un compte existe avec cette adresse, un e-mail de reinitialisation a ete envoye.";
      } catch (error) {
        if (error.response?.data?.errors) {
          this.errors = error.response.data.errors.reduce((acc, err) => {
            acc[err.field] = err.message;
            return acc;
          }, {});
        } else {
          this.errors = {
            general: "Impossible d'envoyer la demande pour le moment."
          };
        }
      } finally {
        this.isSubmitting = false;
      }
    }
  }
};
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - 2rem);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background: var(--color-beige);
}

.auth-panel {
  width: min(540px, 100%);
  color: var(--color-brown);
}

.auth-text {
  margin-bottom: 1.5rem;
  text-align: center;
  line-height: 1.5;
}

.auth-link {
  display: block;
  margin-top: 1.25rem;
  color: var(--color-blue);
  font-weight: bold;
  text-align: center;
}

.submit-btn:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.success-message {
  color: var(--color-green);
  font-weight: bold;
  line-height: 1.4;
  margin: 0;
  text-align: center;
}
</style>

<style src="../../assets/css/form.css"></style>
