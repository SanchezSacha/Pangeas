<template>
  <SuccessPopup v-if="showSuccessPopup" :message="successMessage" @closed="showSuccessPopup = false"/>
  <ErrorPopup v-if="showErrorPopup" :message="errorMessage" @closed="showErrorPopup = false"/>

  <div class="edit-account">
    <div class="row align-items-center g-4">
      <div class="col-12 col-md-4 d-flex justify-content-center">
        <div class="avatar-upload">
          <label for="avatar">
            <img :src="avatarPreview" alt="Avatar" class="avatar-image" />
            <input type="file" id="avatar" @change="handleAvatarChange" @input="markModified" hidden />
            <div class="avatar-hover"></div>
          </label>
        </div>
      </div>

      <div class="col-12 col-md-8">
        <div class="pseudo-section">
          <input v-if="isEditingPseudo" v-model="form.pseudo" class="pseudo-input"  @blur="isEditingPseudo = false" @input="markModified" autofocus/>
          <span @click="isEditingPseudo = true" v-else>{{ form.pseudo }}</span>
          <img src="/icons/pen.svg" class="pen-icon cursor-pointer"/>
        </div>

        <div class="bio-section">
          <label for="bio">Bio
            <img src="/icons/pen.svg" alt="Modifier la bio" class="pen-icon" />
          </label>
          <textarea id="bio" v-model="form.bio" class="textarea" rows="3" @input="markModified"></textarea>
          <p v-if="errors.bio" class="text-red-500 text-sm mt-1">{{ errors.bio }}</p>
        </div>

        <div class="btn-actions" v-if="formModified || avatarFile">
          <button @click="submitUpdate" class="btn-primary">Sauvegarder</button>
          <button @click="resetChanges" class="btn-secondary">Annuler</button>
        </div>
      </div>
    </div>
  </div>

</template>


<script>
import SuccessPopup from "../Modal/SuccessPopup.vue";
import ErrorPopup from "../Modal/ErrorPopup.vue";
import axios from "@/axios";

export default {
  name: 'EditAccount',
  components: {
    SuccessPopup,
    ErrorPopup
  },
  props: {
    user: {
      type: Object,
      default: true
    }
  },
  emits: ['updateUser'],
  data() {
    return {
      form: {
        pseudo: '',
        bio: ''
      },
      avatarFile: null,
      avatarPreview: '/img-avatar.jpg',
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
      errors: {},
      showSuccessPopup: false,
      showErrorPopup: false,
      successMessage: "",
      errorMessage: "",
      formModified: false,
      isEditingPseudo: false,
    };
  },
  watch: {
    user(newUser) {
      if (newUser) {
        this.form.pseudo = newUser.pseudo;
        this.form.bio = newUser.bio || '';
        this.avatarPreview = newUser.avatar_url ? `${this.apiBaseUrl}${newUser.avatar_url}` : '/img-avatar.jpg';
      }
    }
  },
  methods: {
    handleAvatarChange(e) {
      const file = e.target.files[0];
      if (file) {
        this.avatarFile = file;
        this.avatarPreview = URL.createObjectURL(file);
      }
    },
    async submitUpdate() {
      const formData = new FormData();
      formData.append('pseudo', this.form.pseudo);
      formData.append('bio', this.form.bio);
      if (this.avatarFile) {
        formData.append('avatar', this.avatarFile);
      }

      try {
        const response = await axios.put('/api/auth/update', formData, {withCredentials: true});
        const data = response.data;

        if (data.success) {
          this.$emit('updateUser', data.user);

          this.errors = {};
          this.formModified = false;
          this.avatarFile = null;

          this.successMessage = "Profil mis à jour avec succès !";
          this.showSuccessPopup = true;
        } else if (data.errors) {
          this.errors = data.errors.reduce((acc, err) => {
            acc[err.field] = err.message;
            return acc;
          }, {});
        } else {
          this.errorMessage = data.message || "Une erreur s’est produite.";
          this.showErrorPopup = true;
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour :', error);

        this.errorMessage = "Une erreur s’est produite.";
        this.showErrorPopup = true;
      }
    },
    markModified() {
      this.formModified = true;
    },
    resetChanges() {
      if (this.user) {
        this.form.pseudo = this.user.pseudo;
        this.form.bio = this.user.bio || '';
        this.avatarPreview = this.user.avatar_url ? `${this.apiBaseUrl}${this.user.avatar_url}` : '/img-avatar.jpg';
        this.avatarFile = null;
        this.errors = {};
        this.formModified = false;
        this.isEditingPseudo = false;
      }
    }
  },
  mounted() {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    if (this.user) {
      this.form.pseudo = this.user.pseudo;
      this.form.bio = this.user.bio || '';
      this.avatarPreview = this.user.avatar_url ? `${apiBaseUrl}${this.user.avatar_url}` : '/img-avatar.jpg';
    }
  }

};
</script>

<style scoped>
.edit-account {
  margin: 2rem auto;
  padding: 2rem 1rem;
  color: var(--color-brown);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

/* Avatar */
.avatar-upload {
  position: relative;
  width: 180px;
  height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-upload label {
  position: relative;
  display: inline-block;
  width: 180px;
  height: 180px;
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

/* Pseudo */
.pseudo-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1.8rem;
  font-weight: 700;
  margin-top: 1rem;
  transition: transform 0.2s ease, color 0.2s ease;
  cursor: pointer;
}

.pseudo-section:hover {
  transform: scale(1.05);
}

.pseudo-input {
  font-size: 1.8rem;
  max-width: 500px;
  font-weight: 700;
  text-align: center;
  border: 2px solid var(--color-brown);
  outline: none;
}


/* Bio */
.bio-section {
  margin-top: 1rem;
}
.bio-section label {
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}
.textarea {
  background: transparent;
  border: 2px solid #5a3e36;
  border-radius: 1rem;
  padding: 1rem;
  width: 100%;
  font-size: 1rem;
  color: #5a3e36;
  line-height: 1.4;
}

.pen-icon {
  width: 18px;
  height: 18px;
  opacity: 0.8;
}

.btn-primary {
  background-color: #5a3e36;
  color: white;
  font-weight: 600;
  padding: 10px 16px;
  border-radius: 0.6rem;
  margin-top: 2rem;
  width: 100%;
}
.btn-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}
.btn-secondary {
  background-color: #5a3e36;
  color: white;
  font-weight: 600;
  padding: 10px 16px;
  border-radius: 0.6rem;
  margin-top: 2rem;
  width: 100%;
}

</style>
