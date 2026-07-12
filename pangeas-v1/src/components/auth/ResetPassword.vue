<template>
  <main class="auth-page">
    <section class="auth-panel">
      <h1 class="form-title">Nouveau mot de passe</h1>
      <p class="auth-text">
        Choisissez un nouveau mot de passe pour recuperer l'acces a votre compte.
      </p>

      <form class="form-container" @submit.prevent="submitForm" novalidate>
        <div class="input-duo">
          <div class="input-group">
            <span class="input-group-text">
              <img src="/icons/lock.svg" alt="Mot de passe" style="width: 18px;" />
            </span>
            <input
                type="password"
                class="form-control"
                placeholder="Nouveau mot de passe *"
                v-model="form.password"
                required
            />
          </div>
          <p class="text-error" v-if="errors.password">{{ errors.password }}</p>

          <div class="input-group">
            <span class="input-group-text">
              <img src="/icons/lock-open.svg" alt="Confirmation" style="width: 18px;" />
            </span>
            <input
                type="password"
                class="form-control"
                placeholder="Confirmer le mot de passe *"
                v-model="form.confirmPassword"
                required
            />
          </div>
          <p class="text-error" v-if="errors.confirmPassword">{{ errors.confirmPassword }}</p>
          <p class="text-error" v-if="errors.token">{{ errors.token }}</p>
          <p class="text-error" v-if="errors.general">{{ errors.general }}</p>
          <p class="success-message" v-if="successMessage">{{ successMessage }}</p>
        </div>

        <button type="submit" class="submit-btn" :disabled="isSubmitting || !token">
          {{ isSubmitting ? 'Mise a jour...' : 'Modifier le mot de passe' }}
        </button>
      </form>

      <router-link class="auth-link" :to="{ name: 'Home' }">Retour a l'accueil</router-link>
    </section>
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
      isSubmitting: false
    };
  },
  computed: {
    token() {
      return this.$route.query.token || this.$route.params.token || "";
    }
  },
  mounted() {
    if (!this.token) {
      this.errors = {
        token: "Le lien de reinitialisation est invalide ou incomplet."
      };
    }
  },
  methods: {
    async submitForm() {
      this.errors = {};
      this.successMessage = "";

      if (!this.token) {
        this.errors = {
          token: "Le lien de reinitialisation est invalide ou incomplet."
        };
        return;
      }

      if (!this.form.password) {
        this.errors = { password: "Le nouveau mot de passe est obligatoire." };
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

        this.successMessage = "Votre mot de passe a bien ete modifie.";
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
