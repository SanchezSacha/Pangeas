<template>
  <main class="auth-standalone-page">
    <div class="auth-split">
      <aside class="auth-split-visual" aria-hidden="true">
        <div class="auth-expedition-card">
          <img
              class="auth-expedition-image"
              src="/auth/reset-password-key.png"
              alt=""
              aria-hidden="true"
          />
          <div class="auth-expedition-steps">
            <div class="auth-expedition-step">
              <span class="auth-step-number">1</span>
              <span class="auth-step-icon">
                <img src="/icons/link.svg" alt="" aria-hidden="true" />
              </span>
              <div>
                <strong>Lien validé</strong>
                <p>Vous êtes au bon point de départ.</p>
              </div>
            </div>
            <div class="auth-expedition-step">
              <span class="auth-step-number">2</span>
              <span class="auth-step-icon">
                <img src="/icons/key-round.svg" alt="" aria-hidden="true" />
              </span>
              <div>
                <strong>Nouveau mot de passe</strong>
                <p>Vous choisissez une nouvelle clé.</p>
              </div>
            </div>
            <div class="auth-expedition-step">
              <span class="auth-step-number">3</span>
              <span class="auth-step-icon">
                <img src="/icons/lock-keyhole.svg" alt="" aria-hidden="true" />
              </span>
              <div>
                <strong>Accès sécurisé</strong>
                <p>Le compte est prêt pour la suite.</p>
              </div>
            </div>
          </div>
        </div>
        <div class="auth-visual-copy">
          <p class="auth-visual-kicker">Nouvelle étape</p>
          <h2>Sécurisez votre prochaine exploration.</h2>
          <p>Choisissez un mot de passe solide avant de reprendre votre route.</p>
        </div>
      </aside>

      <section class="auth-shell auth-recovery-shell" aria-labelledby="reset-password-title">
        <header class="auth-header auth-recovery-header">
          <img src="/logo_mobile_pangeas.png" alt="PANGEAS" class="auth-logo" />
          <h1 id="reset-password-title" class="auth-title">Nouveau mot de passe</h1>
          <p class="auth-slogan">
            Choisissez un nouveau mot de passe pour récupérer l'accès à votre compte.
          </p>
        </header>

        <div class="auth-alert auth-success-alert" v-if="successMessage" role="status">
          <span class="auth-alert-icon" aria-hidden="true">✓</span>
          <p>{{ successMessage }}</p>
        </div>

        <div class="auth-alert" v-if="errors.token || errors.general" role="alert">
          <span class="auth-alert-icon" aria-hidden="true">!</span>
          <p>{{ errors.token || errors.general }}</p>
        </div>

        <form class="auth-form auth-recovery-form" @submit.prevent="submitForm" novalidate>
          <div class="auth-field">
            <label class="auth-label" for="reset-password">Nouveau mot de passe</label>
            <div class="auth-control">
              <img class="auth-icon" src="/icons/lock.svg" alt="" aria-hidden="true" />
              <input
                  class="auth-input"
                  id="reset-password"
                  :type="showPassword ? 'text' : 'password'"
                  v-model="form.password"
                  autocomplete="new-password"
                  required
              />
              <button
                  type="button"
                  class="auth-password-toggle"
                  :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
                  @click="showPassword = !showPassword"
              >
                <img
                    class="auth-eye"
                    :src="showPassword ? '/icons/eye.svg' : '/icons/eye-closed.svg'"
                    alt=""
                    aria-hidden="true"
                />
              </button>
            </div>
            <p class="auth-help">12 caractères minimum</p>
            <p class="auth-error" v-if="passwordLengthError || errors.password">
              {{ errors.password || "Le mot de passe doit contenir au moins 12 caractères" }}
            </p>
          </div>

          <div class="auth-field">
            <label class="auth-label" for="reset-confirm-password">Confirmation du mot de passe</label>
            <div class="auth-control">
              <img class="auth-icon" src="/icons/lock-open.svg" alt="" aria-hidden="true" />
              <input
                  class="auth-input"
                  id="reset-confirm-password"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  v-model="form.confirmPassword"
                  autocomplete="new-password"
                  required
              />
              <button
                  type="button"
                  class="auth-password-toggle"
                  :aria-label="showConfirmPassword ? 'Masquer la confirmation' : 'Afficher la confirmation'"
                  @click="showConfirmPassword = !showConfirmPassword"
              >
                <img
                    class="auth-eye"
                    :src="showConfirmPassword ? '/icons/eye.svg' : '/icons/eye-closed.svg'"
                    alt=""
                    aria-hidden="true"
                />
              </button>
            </div>
            <p class="auth-error" v-if="errors.confirmPassword">{{ errors.confirmPassword }}</p>
          </div>

          <button type="submit" class="auth-submit auth-recovery-submit" :disabled="isSubmitting || !token">
            {{ isSubmitting ? 'Mise à jour...' : 'Modifier le mot de passe' }}
            <span class="auth-submit-arrow" aria-hidden="true">→</span>
          </button>
        </form>

        <footer class="auth-footer auth-recovery-footer">
          <p class="auth-footer-text">
            Vous avez retrouvé votre accès ?
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
  name: "ResetPassword",
  data() {
    return {
      form: {
        password: "",
        confirmPassword: ""
      },
      errors: {},
      successMessage: "",
      isSubmitting: false,
      showPassword: false,
      showConfirmPassword: false
    };
  },
  computed: {
    token() {
      return this.$route.query.token || this.$route.params.token || "";
    },
    passwordLengthError() {
      return this.form.password.length > 0 && this.form.password.length < 12;
    }
  },
  mounted() {
    if (!this.token) {
      this.errors = {
        token: "Le lien de réinitialisation est invalide ou incomplet."
      };
    }
  },
  methods: {
    async submitForm() {
      this.errors = {};
      this.successMessage = "";

      if (!this.token) {
        this.errors = {
          token: "Le lien de réinitialisation est invalide ou incomplet."
        };
        return;
      }

      if (!this.form.password) {
        this.errors = { password: "Le nouveau mot de passe est obligatoire." };
        return;
      }

      if (this.form.password.length < 12) {
        this.errors = { password: "Le mot de passe doit contenir au moins 12 caractères." };
        return;
      }

      if (this.form.password !== this.form.confirmPassword) {
        this.errors = {
          confirmPassword: "Les mots de passe ne correspondent pas."
        };
        return;
      }

      this.isSubmitting = true;

      try {
        await axios.post(
            "/api/auth/reset-password",
            {
              token: this.token,
              password: this.form.password,
              confirmPassword: this.form.confirmPassword
            },
            { headers: { "Content-Type": "application/json" } }
        );

        this.successMessage = "Votre mot de passe a bien été modifié.";
        setTimeout(() => {
          this.$router.push({ name: "Home" });
        }, 1200);
      } catch (error) {
        if (error.response?.data?.errors) {
          this.errors = error.response.data.errors.reduce((acc, err) => {
            acc[err.field] = err.message;
            return acc;
          }, {});
        } else {
          this.errors = {
            general: error.response?.data?.message || "Impossible de modifier le mot de passe."
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
