<template>
  <div class="container">
    <h1 class="form-title">Créer votre compte</h1>

    <form class="form-container" @submit.prevent="submitForm">
      <div class="row align-items-center mb-4">
        <!-- Avatar -->
        <div class="col-12 col-md-4 d-flex justify-content-center mb-3 mb-md-0">
          <div class="avatar-upload">
            <label for="avatar">
              <img :src="avatarPreview" alt="Avatar" class="avatar-image" />
              <div class="avatar-overlay">
                <img src="/icons/upload.svg" alt="Upload" class="upload-icon" />
              </div>
              <input type="file" id="avatar" @change="handleAvatar" hidden />
            </label>
          </div>
        </div>

        <!-- Pseudo + Email -->
        <div class="col-12 col-md-8">
          <div class="row">
            <div class="col-12 mb-3">
              <div class="input-group">
                <span class="input-group-text">
                  <img src="/icons/user.svg" alt="Utilisateur" style="width: 18px;" />
                </span>
                <input type="text" class="form-control" placeholder="Pseudo *" v-model="form.username" required />
              </div>
            </div>
            <div class="col-12">
              <div class="input-group">
                <span class="input-group-text">
                  <img src="/icons/mail.svg" alt="Mail" style="width: 18px;" />
                </span>
                <input type="email" class="form-control" placeholder="Adresse mail *" v-model="form.email" required />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bio -->
      <div class="form-group mb-3">
        <div class="input-group">
           <span class="input-group-text">
              <img src="/icons/pen.svg" alt="Stylo" style="width: 18px;" />
           </span>
           <textarea class="form-control" placeholder="Je suis..." v-model="form.bio"></textarea>
        </div>
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
        </div>
        <div class="col-12 col-md-6 mb-3">
          <div class="input-group">
            <span class="input-group-text">
              <img src="/icons/lock.svg" alt="Confirmation mot de passe" style="width: 18px;" />
            </span>
            <input type="password" class="form-control" placeholder="Confirmation Mot de passe *" v-model="form.passwordConfirm" required />
          </div>
        </div>
      </div>

      <!-- Terms -->
      <div class="form-group checkbox mb-3">
        <input type="checkbox" id="terms" v-model="form.terms" required />
        <label for="terms">
          Je déclare avoir lu et accepter les
          <a href="#">Conditions Générales d’Utilisation</a>.
        </label>
      </div>

      <button type="submit" class="submit-btn">Créer mon compte</button>
    </form>
  </div>
</template>


<script>
export default {
  name: "Registration",
  data() {
    return {
      form: {
        username: "",
        email: "",
        bio: "",
        password: "",
        passwordConfirm: "",
        terms: false,
      },
      avatarPreview: "/img-avatar.jpg",
    };
  },
  methods: {
    handleAvatar(event) {
      const file = event.target.files[0];
      if (file) {
        this.avatarPreview = URL.createObjectURL(file);
      }
    },
    submitForm() {
      console.log("Formulaire soumis avec :", this.form);
    },
  },
};
</script>

<style scoped>
.avatar-upload {
  position: relative;
}

.avatar-image {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  opacity: 0.6;
  border: 3px solid var(--color-brown);
}

.avatar-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.upload-icon {
  width: 28px;
  height: 28px;
  opacity: 0.9;
}

textarea {
  min-height: 90px;
  resize: none;
}
</style>

<style src="../../assets/css/form.css"></style>
