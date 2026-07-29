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
import SuccessPopup from "../modal/SuccessPopup.vue";
import ErrorPopup from "../modal/ErrorPopup.vue";
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
      avatarPreview: '/logo_mobile_pangeas.png',
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
        this.avatarPreview = newUser.avatar_url ? `${this.apiBaseUrl}${newUser.avatar_url}` : '/logo_mobile_pangeas.png';
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
        this.avatarPreview = this.user.avatar_url ? `${this.apiBaseUrl}${this.user.avatar_url}` : '/logo_mobile_pangeas.png';
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
      this.avatarPreview = this.user.avatar_url ? `${apiBaseUrl}${this.user.avatar_url}` : '/logo_mobile_pangeas.png';
    }
  }

};
</script>

<style scoped>
.edit-account {
  margin: 2rem auto;
  padding: 1.5rem;
  color: #442a22;
  border: 1px solid rgba(212, 195, 190, 0.58);
  border-radius: 0.6rem;
  background: rgba(247, 243, 238, 0.82);
  box-shadow: 0 8px 30px rgba(68, 42, 34, 0.055);
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
  border: 4px solid #f1ede8;
  background: #5d4037;
  box-shadow: 0 10px 26px rgba(68, 42, 34, 0.16);
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
  background: rgba(68, 42, 34, 0.32);
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
  color: #442a22;
  transition: color 0.2s ease;
  cursor: pointer;
}

.pseudo-section:hover {
  color: #5d4037;
}

.pseudo-input {
  font-size: 1.8rem;
  max-width: 500px;
  font-weight: 700;
  text-align: center;
  border: 1px solid rgba(212, 195, 190, 0.95);
  border-bottom-width: 2px;
  border-radius: 0.5rem 0.5rem 0 0;
  background: #fdf9f4;
  color: #1c1c19;
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
  color: #665852;
}
.textarea {
  background: #fdf9f4;
  border: 1px solid rgba(212, 195, 190, 0.95);
  border-bottom-width: 2px;
  border-radius: 0.5rem 0.5rem 0 0;
  padding: 1rem;
  width: 100%;
  font-size: 1rem;
  color: #1c1c19;
  line-height: 1.4;
  outline: none;
  resize: vertical;
}

.pen-icon {
  width: 18px;
  height: 18px;
  opacity: 0.8;
}

.btn-primary {
  background: #442a22;
  color: #fff;
  border: 2px solid #442a22;
  font-weight: 900;
  padding: 10px 16px;
  border-radius: 999px;
  margin-top: 2rem;
  width: 100%;
  transition: transform 0.2s ease, background 0.2s ease;
}
.btn-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}
.btn-secondary {
  background: transparent;
  color: #5d4037;
  border: 2px solid #5d4037;
  font-weight: 900;
  padding: 10px 16px;
  border-radius: 999px;
  margin-top: 2rem;
  width: 100%;
  transition: transform 0.2s ease, background 0.2s ease;
}

.btn-primary:hover,
.btn-secondary:hover {
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .edit-account {
    margin-top: 0;
    padding: 1.1rem;
  }

  .btn-actions {
    flex-direction: column;
    gap: 0.75rem;
  }

  .btn-primary,
  .btn-secondary {
    margin-top: 0;
  }
}

</style>
