<template>
  <div class="container">
    <SuccessPopup v-if="showSuccess" :message="successMessage" @closed="handleSuccessClose"/>
    <h1 class="form-title">Connexion</h1>
    <form class="form-container" @submit.prevent="submitForm()" novalidate>
      <div class="input-duo">
        <div class="input-group">
          <span class="input-group-text">
            <img src="/icons/mail.svg" alt="Mail" style="width: 18px;" />
          </span>
          <input type="email" class="form-control" placeholder="Adresse mail *" v-model="form.email" required />
        </div>
        <p class="text-error" v-if="errors.email">{{ errors.email }}</p>

        <div class="input-group">
          <span class="input-group-text">
            <img src="/icons/lock.svg" alt="Mot de passe" style="width: 18px;" />
          </span>
          <input type="password" class="form-control" placeholder="Mot de passe *" v-model="form.password" required />
        </div>
        <p class="text-error" v-if="errors.password">{{ errors.password }}</p>
      </div>

      <p class="link-register mt-4">
        Vous n’avez pas de compte ?
        <a href="#" @click.prevent="$emit('open-register-from-login')">Inscrivez-vous ici</a>
      </p>

      <button type="submit" class="submit-btn">Connexion</button>
    </form>
  </div>
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
      showSuccess: false
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
          this.errors = { general: "Une erreur s’est produite." };
        }
      }
    },
    handleSuccessClose() {
      this.showSuccess = false;
      this.$emit('close-login');
    }
  }

};
</script>

<style scoped>

p{
  text-align: center;
}

</style>

<style src="../../assets/css/form.css"></style>
