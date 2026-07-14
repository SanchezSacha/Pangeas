<template>
  <section class="auth-shell" aria-labelledby="registration-title">
    <SuccessPopup v-if="showSuccess" :message="successMessage" @closed="redirectToLogin"/>
    <ErrorPopup v-if="showError" :message="errorMessage" @closed="showError = false" />

    <header class="auth-header">
      <img src="/logo_mobile_pangeas.png" alt="PANGEAS" class="auth-logo" />
      <h1 id="registration-title" class="auth-title">Rejoignez l'aventure</h1>
      <p class="auth-slogan">Découvrez des lieux insolites et collectionnez vos aventures.</p>
    </header>

    <form class="auth-form" @submit.prevent="submitForm" novalidate>
      <div class="auth-field">
        <label class="auth-label" for="pseudo">Nom d'explorateur</label>
        <div class="auth-control">
          <img class="auth-icon" src="/icons/user.svg" alt="" aria-hidden="true" />
          <input
              class="auth-input"
              id="pseudo"
              type="text"
              v-model="form.pseudo"
              placeholder="Votre pseudo"
              autocomplete="username"
              required
          />
        </div>
        <p class="auth-error" v-if="errors.pseudo">{{ errors.pseudo }}</p>
      </div>

      <div class="auth-field">
        <label class="auth-label" for="email">Adresse e-mail</label>
        <div class="auth-control">
          <img class="auth-icon" src="/icons/mail.svg" alt="" aria-hidden="true" />
          <input
              class="auth-input"
              id="email"
              type="email"
              v-model="form.email"
              placeholder="votre@email.com"
              autocomplete="email"
              required
          />
        </div>
        <p class="auth-error" v-if="errors.email">{{ errors.email }}</p>
      </div>

      <div class="auth-field">
        <label class="auth-label" for="password">Mot de passe</label>
        <div class="auth-control">
          <img class="auth-icon" src="/icons/lock.svg" alt="" aria-hidden="true" />
          <input
              class="auth-input"
              id="password"
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
        <label class="auth-label" for="confirmPassword">Confirmation du mot de passe</label>
        <div class="auth-control">
          <img class="auth-icon" src="/icons/lock-open.svg" alt="" aria-hidden="true" />
          <input
              class="auth-input"
              id="confirmPassword"
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

      <div class="auth-terms">
        <input
            class="auth-checkbox"
            type="checkbox"
            id="terms"
            v-model="form.cgu_accepted"
            required
        />
        <label class="auth-terms-label" for="terms">
          Je déclare avoir lu et accepter les
          <router-link class="auth-link" to="/cgu" @click="closeModal">
            Conditions Générales d'Utilisation
          </router-link>
        </label>
      </div>
      <p class="auth-error auth-terms-error" v-if="errors.cgu_accepted">{{ errors.cgu_accepted }}</p>

      <button type="submit" class="auth-submit" :disabled="showSuccess">
        Créer mon compte
      </button>
    </form>

    <footer class="auth-footer">
      <p class="auth-footer-text">
        Vous avez déjà un compte ?
        <a class="auth-link" href="#" @click.prevent="$emit('open-login')">Connectez-vous</a>
      </p>
    </footer>
  </section>
</template>


<script>
import SuccessPopup from "./SuccessPopup.vue";
import ErrorPopup from "./ErrorPopup.vue";
import axios from "@/axios.js";

export default {
  name: "Registration",
  components: {
    ErrorPopup,
    SuccessPopup
  },
  data() {
    return {
      form: {
        pseudo: "",
        email: "",
        bio: "",
        password: "",
        confirmPassword: "",
        cgu_accepted: false,
      },
      errors: {},
      showSuccess: false,
      successMessage: "",
      showError: false,
      errorMessage: "",
      showPassword: false,
      showConfirmPassword: false
    };
  },
  computed: {
    passwordLengthError() {
      return this.form.password.length > 0 && this.form.password.length < 12;
    }
  },
  methods: {
    closeModal() {
      this.$emit('close');
    },
    async submitForm() {
      try {
        this.errors = {};

        const formData = new FormData();
        formData.append("pseudo", this.form.pseudo);
        formData.append("email", this.form.email);
        formData.append("password", this.form.password);
        formData.append("confirmPassword", this.form.confirmPassword);
        formData.append("cgu_accepted", this.form.cgu_accepted ? "true" : "false");
        formData.append("bio", this.form.bio || "");

        const response = await axios.post("/api/auth/inscription", formData, {withCredentials: true,});
        const data = response.data;

        this.successMessage = data.message || "Inscription réussie !";
        this.showSuccess = true;

      } catch (error) {
        if (error.response && error.response.data && error.response.data.errors) {
          this.errors = error.response.data.errors.reduce((acc, err) => {
            acc[err.field] = err.message;
            return acc;
          }, {});
        } else {
          this.errorMessage = "Une erreur s'est produite.";
          this.showError = true;
        }
      }
    },
    redirectToLogin() {
      this.showSuccess = false;
      this.$emit('open-login');
    }
  }
};
</script>

<style src="../../assets/css/auth.css"></style>
