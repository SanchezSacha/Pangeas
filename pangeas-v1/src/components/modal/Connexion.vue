<template>
  <section class="auth-shell auth-login-shell" aria-labelledby="login-title">
    <SuccessPopup v-if="showSuccess" :message="successMessage" @closed="handleSuccessClose"/>

    <header class="auth-header auth-login-header">
      <img src="/logo_mobile_pangeas.png" alt="PANGEAS" class="auth-logo" />
      <h1 id="login-title" class="auth-title">Bon retour parmi nous</h1>
      <p class="auth-slogan">Connectez-vous pour poursuivre votre aventure.</p>
    </header>

    <div class="auth-alert" v-if="errors.general" role="alert">
      <span class="auth-alert-icon" aria-hidden="true">!</span>
      <p>{{ errors.general }}</p>
    </div>

    <form class="auth-form auth-login-form" @submit.prevent="submitForm()" novalidate>
      <div class="auth-field">
        <label class="auth-label" for="login-email">Adresse e-mail</label>
        <div class="auth-control auth-login-control">
          <input
              class="auth-input"
              id="login-email"
              type="email"
              v-model="form.email"
              placeholder="test@gmail.com"
              autocomplete="email"
              required
          />
          <span class="auth-symbol" aria-hidden="true">@</span>
        </div>
        <p class="auth-error" v-if="errors.email">{{ errors.email }}</p>
      </div>

      <div class="auth-field">
        <div class="auth-label-row">
          <label class="auth-label" for="login-password">Mot de passe</label>
          <a class="auth-forgot-link" href="#" @click.prevent="goToForgotPassword">Oublié ?</a>
        </div>
        <div class="auth-control auth-login-control">
          <input
              class="auth-input"
              id="login-password"
              :type="showPassword ? 'text' : 'password'"
              v-model="form.password"
              placeholder="••••••••"
              autocomplete="current-password"
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
        <p class="auth-error" v-if="errors.password">{{ errors.password }}</p>
      </div>

      <button type="submit" class="auth-submit auth-login-submit" :disabled="showSuccess">
        Se connecter
        <span class="auth-submit-arrow" aria-hidden="true">→</span>
      </button>
    </form>

    <footer class="auth-footer auth-login-footer">
      <div class="auth-separator" aria-hidden="true">
        <span></span>
        <strong>OU</strong>
        <span></span>
      </div>
      <p class="auth-footer-text">
        Vous n'avez pas de compte ?
        <a class="auth-link" href="#" @click.prevent="$emit('open-register-from-login')">Inscrivez-vous</a>
      </p>
    </footer>
  </section>
</template>

<script>
import SuccessPopup from "./SuccessPopup.vue";
import { mapMutations } from 'vuex';
import axios from "@/axios.js";

export default {
  name: "Connexion",
  components: { SuccessPopup },
  data() {
    return {
      form: {
        password: "",
        email: "",
      },
      errors: {},
      successMessage: "",
      showSuccess: false,
      showPassword: false
    };
  },
  methods: {
    ...mapMutations(['setUser']),

    async submitForm() {
      try {
        this.errors = {};
        const response = await axios.post(
            "/api/auth/connexion",
            this.form,
            {
              headers: { "Content-Type": "application/json" },
              withCredentials: true
            }
        );

        const data = response.data;

        this.setUser(data.user);
        this.successMessage = data.message || "Connexion réussie !";
        this.showSuccess = true;

      } catch (error) {
        if (error.response && error.response.status === 400 && error.response.data.errors) {
          this.errors = error.response.data.errors.reduce((acc, err) => {
            acc[err.field] = err.message;
            return acc;
          }, {});
        } else {
          this.errors = { general: "Identifiants incorrects. Veuillez vérifier votre email et mot de passe." };
        }
      }
    },
    goToForgotPassword() {
      this.$emit('close-login');
      this.$router.push({ name: 'ForgotPassword' });
    },
    handleSuccessClose() {
      this.showSuccess = false;
      this.$emit('close-login');
    }
  }
};
</script>

<style src="../../assets/css/auth.css"></style>
