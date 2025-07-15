<template>
  <div class="container">
    <SuccessPopup v-if="showSuccess" :message="successMessage" @closed="redirectToLogin"/>
    <h1 class="form-title">Créer votre compte</h1>

    <form class="form-container" @submit.prevent="submitForm" novalidate>
      <div class="row align-items-center mb-4">
        <!-- Avatar -->
        <div class="col-12 col-md-4 d-flex justify-content-center mb-3 mb-md-0">
          <div class="avatar-upload">
            <label for="avatar">
              <img :src="avatarPreview" alt="Avatar" class="avatar-image" />
              <input type="file" id="avatar" @change="handleAvatar" hidden />
              <div class="avatar-hover"></div>
            </label>
          </div>
        </div>
        <p class="text-error d-md-none mt-2" v-if="errors.avatar">{{ errors.avatar }}</p>

        <!-- Pseudo + Email -->
        <div class="col-12 col-md-8">
          <div class="row">
            <div class="col-12 mb-3">
              <div class="input-group">
                <span class="input-group-text">
                  <img src="/icons/user.svg" alt="Utilisateur" style="width: 18px;" />
                </span>
                <input type="text" class="form-control" placeholder="Pseudo *" v-model="form.pseudo" required />
              </div>
              <p class="text-error" v-if="errors.pseudo">{{ errors.pseudo }}</p>
            </div>
            <div class="col-12">
              <div class="input-group">
                <span class="input-group-text">
                  <img src="/icons/mail.svg" alt="Mail" style="width: 18px;" />
                </span>
                <input type="email" class="form-control" placeholder="Adresse mail *" v-model="form.email" required />
              </div>
              <p class="text-error" v-if="errors.email">{{ errors.email }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Bio -->
      <div class="form-group mb-3">
        <p class="text-error d-none d-md-block" v-if="errors.avatar">{{ errors.avatar }}</p>
        <div class="input-group">
           <span class="input-group-text">
              <img src="/icons/pen.svg" alt="Stylo" style="width: 18px;" />
           </span>
           <textarea class="form-control" placeholder="Je suis..." v-model="form.bio"></textarea>
        </div>
        <p class="text-error" v-if="errors.bio">{{ errors.bio }}</p>
      </div>

      <!-- Passwords -->
      <div class="row">
        <div class="col-12 col-md-6 mb-3">
          <div class="input-group">
            <span class="input-group-text">
              <img src="/icons/lock-open.svg" alt="Mot de passe" style="width: 18px;" />
            </span>
            <input type="password" class="form-control" placeholder="Mot de passe *" v-model="form.password" required />
          </div>
          <p class="text-error" v-if="errors.password">{{ errors.password }}</p>
        </div>
        <!-- Confirmation Password -->
        <div class="col-12 col-md-6 mb-3">
          <div class="input-group">
            <span class="input-group-text">
              <img src="/icons/lock.svg" alt="Confirmation mot de passe" style="width: 18px;" />
            </span>
            <input type="password" class="form-control" placeholder="Confirmation Mot de passe *" v-model="form.confirmPassword" required />
          </div>
          <p class="text-error" v-if="errors.confirmPassword">{{ errors.confirmPassword }}</p>
        </div>
      </div>

      <!-- Terms -->
      <div class="form-group checkbox mb-3">
        <input type="checkbox" id="terms" v-model="form.cgu_accepted" required />
        <label for="terms">
          Je déclare avoir lu et accepter les
          <a href="#">Conditions Générales d’Utilisation</a>.
          <p class="text-error" v-if="errors.cgu_accepted">{{ errors.cgu_accepted }}</p>
        </label>
      </div>

      <button type="submit" class="submit-btn" :disabled="showSuccess">Créer mon compte</button>
    </form>
  </div>
</template>


<script>
import SuccessPopup from "./SuccessPopup.vue";

export default {
  name: "Registration",
  components: { SuccessPopup },
  data() {
    return {
      form: {
        pseudo: "",
        email: "",
        bio: "",
        password: "",
        confirmPassword: "",
        cgu_accepted: false,
        successMessage: "",
      },
      avatarFile: null,
      avatarPreview: "/img-avatar.jpg",
      errors: {},
      showSuccess: false,
      successMessage: "",
    };
  },
  methods: {
    handleAvatar(event) {
      const file = event.target.files[0];
      if (file) {
        this.avatarFile = file;
        this.avatarPreview = URL.createObjectURL(file);
      }
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
        if (this.avatarFile) {
          formData.append("avatar", this.avatarFile);
        }

        const response = await fetch("http://localhost:3000/api/auth/inscription", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          this.errors = data.errors.reduce((acc, err) => {
            acc[err.field] = err.message;
            return acc;
          }, {});
          return;
        }

        this.successMessage = data.message || "Inscription réussie !";
        this.showSuccess = true;

      } catch (error) {
        this.errors = { general: "Une erreur s’est produite." };
      }
    },
    redirectToLogin() {
      this.showSuccess = false;
      this.$emit('open-login');
    }
  }
};
</script>

<style src="../../assets/css/form.css"></style>
<style scoped>
.avatar-upload {
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-upload label {
  position: relative;
  display: inline-block;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--color-brown);
  cursor: pointer;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.avatar-hover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: opacity 0.3s;
}

.avatar-upload label:hover .avatar-hover {
  opacity: 1;
}

textarea {
  min-height: 90px;
  resize: none;
}
</style>
