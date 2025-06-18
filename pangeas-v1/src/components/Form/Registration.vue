<template>
  <div class="registration-container">
    <h1 class="title">Créer votre compte</h1>

    <form class="registration-form" @submit.prevent="submitForm">
      <div class="avatar-row mt-4">
        <div class="avatar-upload">
          <label for="avatar">
            <img :src="avatarPreview" alt="Avatar" class="avatar-image" />
            <div class="avatar-overlay">
              <img src="/icons/upload.svg" alt="Upload" class="upload-icon" />
            </div>
            <input type="file" id="avatar" @change="handleAvatar" hidden />
          </label>
        </div>

        <div class="input-duo">
          <div class="form-group">
            <input type="text" placeholder="Pseudo *" v-model="form.username" required />
          </div>
          <div class="form-group">
            <input type="email" placeholder="Adresse mail *" v-model="form.email" required />
          </div>
        </div>
      </div>

      <div class="form-group">
        <textarea placeholder="Je suis..." v-model="form.bio"></textarea>
      </div>

      <div class="form-passwords">
        <div class="form-group">
          <input type="password" placeholder="Mot de passe *" v-model="form.password" required/>
        </div>
        <div class="form-group" style="width: 260px">
          <input type="password" placeholder="Confirmation Mot de Passe *" v-model="form.passwordConfirm" required/>
        </div>
      </div>

      <div class="form-group checkbox">
        <input type="checkbox" id="terms" v-model="form.terms" required />
        <label>Je déclare avoir lu et accepter les <a href="#">Conditions Générales d’Utilisation</a>.</label>
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

<style>

.registration-container {
  background-color: var(--color-beige);
  padding: 0 1.5rem;
  border-radius: 12px;
  width: 550px;
  margin: 0 auto;
  font-family: var(--font-content);
  color: var(--color-brown);
}

.title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 2rem;
}

.registration-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.avatar-row {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 2rem;
}

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

.input-duo {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

input, textarea {
  width: 100%;
  border: 2px solid var(--color-brown);
  border-radius: 20px;
  padding: 0.6rem 1rem 0.6rem 2.5rem;
  font-size: 0.95rem;
  background-color: white;
}

textarea {
  min-height: 90px;
  resize: none;
}

input::placeholder,
textarea::placeholder {
  color: var(--color-brown);
  opacity: 0.7;
  font-weight: bold;
}

input[placeholder^="Pseudo"] {
  background-image: url('/icons/user.svg');
}
input[placeholder^="Adresse"] {
  background-image: url('/icons/mail.svg');
}
textarea[placeholder*="Je suis"] {
  background-image: url('/icons/pen.svg');
  background-repeat: no-repeat;
  background-position: 10px 12px ;
  background-size: 18px;
}
input[placeholder^="Mot de passe"] {
  background-image: url('/icons/lock-open.svg');
}
input[placeholder^="Confirmation"] {
  background-image: url('/icons/lock.svg');
}
input[placeholder] {
  background-repeat: no-repeat;
  background-position: 10px center;
  background-size: 18px;
}

.form-passwords {
  display: flex;
  flex-direction: row;
  gap: 1rem;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  line-height: 1.2;
  margin-top: 0.5rem;
}

.checkbox input[type="checkbox"] {
  margin: 0;
  padding: 0;
  line-height: 1;
  width: 16px;
  height: 16px;
  accent-color: var(--color-brown);
}

.checkbox label {
  margin: 0;
  padding: 0;
  color: var(--color-brown);
  line-height: 1.2;
}

.checkbox label a {
  color: var(--color-blue);
  font-weight: bold;
  text-decoration: underline;
}


.submit-btn {
  width: 100%;
  background-color: var(--color-brown);
  color: white;
  border: none;
  padding: 0.75rem;
  font-size: 1rem;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}
.submit-btn:hover {
  background-color: #3e2723;
}



</style>
