<template>
  <main class="auth-standalone-page">
    <div class="auth-split">
      <aside class="auth-split-visual" aria-hidden="true">
        <div class="auth-expedition-card">
          <img
              class="auth-expedition-image"
              src="/auth/forgot-password-explorer.png"
              alt=""
              aria-hidden="true"
          />
          <div class="auth-expedition-steps">
            <div class="auth-expedition-step">
              <span class="auth-step-number">1</span>
              <span class="auth-step-icon">
                <img src="/icons/mail-check.svg" alt="" aria-hidden="true" />
              </span>
              <div>
                <strong>Entrer l'e-mail</strong>
                <p>On retrouve votre carnet.</p>
              </div>
            </div>
            <div class="auth-expedition-step">
              <span class="auth-step-number">2</span>
              <span class="auth-step-icon">
                <img src="/icons/link.svg" alt="" aria-hidden="true" />
              </span>
              <div>
                <strong>Recevoir le lien</strong>
                <p>Un passage sécurisé arrive.</p>
              </div>
            </div>
            <div class="auth-expedition-step">
              <span class="auth-step-number">3</span>
              <span class="auth-step-icon">
                <img src="/icons/route.svg" alt="" aria-hidden="true" />
              </span>
              <div>
                <strong>Reprendre la route</strong>
                <p>Votre accès est restauré.</p>
              </div>
            </div>
          </div>
        </div>
        <div class="auth-visual-copy">
          <p class="auth-visual-kicker">Carnet de route</p>
          <h2>Retrouvez le chemin vers votre compte.</h2>
          <p>Un lien sécurisé vous permettra de repartir avec un nouveau mot de passe.</p>
        </div>
      </aside>

      <section class="auth-shell auth-recovery-shell" aria-labelledby="forgot-password-title">
        <header class="auth-header auth-recovery-header">
          <img src="/logo_mobile_pangeas.png" alt="PANGEAS" class="auth-logo" />
          <h1 id="forgot-password-title" class="auth-title">Mot de passe oublié ?</h1>
          <p class="auth-slogan">
            Indiquez l'adresse e-mail liée à votre compte. Si elle existe, nous vous enverrons un lien de réinitialisation.
          </p>
        </header>

        <div class="auth-alert auth-success-alert" v-if="successMessage" role="status">
          <span class="auth-alert-icon" aria-hidden="true">✓</span>
          <p>{{ successMessage }}</p>
        </div>

        <div class="auth-alert" v-if="errors.general" role="alert">
          <span class="auth-alert-icon" aria-hidden="true">!</span>
          <p>{{ errors.general }}</p>
        </div>

        <form class="auth-form auth-recovery-form" @submit.prevent="submitForm" novalidate>
          <div class="auth-field">
            <label class="auth-label" for="forgot-email">Adresse e-mail</label>
            <div class="auth-control auth-login-control">
              <input
                  class="auth-input"
                  id="forgot-email"
                  type="email"
                  v-model.trim="email"
                  placeholder="votre@email.com"
                  autocomplete="email"
                  required
              />
              <span class="auth-symbol" aria-hidden="true">@</span>
            </div>
            <p class="auth-error" v-if="errors.email">{{ errors.email }}</p>
          </div>

          <button type="submit" class="auth-submit auth-recovery-submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Envoi en cours...' : 'Envoyer le lien' }}
            <span class="auth-submit-arrow" aria-hidden="true">→</span>
          </button>
        </form>

        <footer class="auth-footer auth-recovery-footer">
          <p class="auth-footer-text">
            Vous vous souvenez de votre mot de passe ?
            <router-link class="auth-link" :to="{ name: 'Home' }">Retour à l'accueil</router-link>
          </p>
        </footer>
      </section>
    </div>
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
        this.errors = { email: "L'adresse e-mail est obligatoire." };
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
        this.successMessage = "Si un compte existe avec cette adresse, un e-mail de réinitialisation a été envoyé.";
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

<style src="../../assets/css/auth.css"></style>
