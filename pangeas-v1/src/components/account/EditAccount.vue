<template>
  <SuccessPopup v-if="showSuccessPopup" :message="successMessage" @closed="showSuccessPopup = false"/>
  <ErrorPopup v-if="showErrorPopup" :message="errorMessage" @closed="showErrorPopup = false"/>

  <section class="profile-hero" aria-labelledby="profile-title">
    <div class="avatar-control">
      <label class="avatar-frame" for="avatar">
        <img :src="avatarPreview" alt="Avatar utilisateur" />
        <input type="file" id="avatar" @change="handleAvatarChange" @input="markModified" hidden />
      </label>
      <span class="avatar-edit" aria-hidden="true">
        <img src="/icons/upload.svg" alt="" />
      </span>
    </div>

    <h2 id="profile-title">{{ form.pseudo }}</h2>
    <p>{{ user?.email }}</p>

    <div class="profile-badges" aria-label="Statut du compte">
      <span>Explorateur</span>
      <span class="level">Niveau {{ user?.level || 1 }}</span>
    </div>

    <div class="profile-bio-card">
      <div class="bio-heading">
        <span>Bio</span>
        <button v-if="!isEditingBio" type="button" aria-label="Modifier la bio" @click="startBioEditing">
          <img src="/icons/pen.svg" alt="" aria-hidden="true" />
        </button>
      </div>

      <p v-if="!isEditingBio" :class="{ empty: !form.bio }">
        {{ form.bio || 'Ajoutez une courte description pour présenter votre profil.' }}
      </p>

      <textarea
          v-else
          id="bio"
          v-model="form.bio"
          rows="4"
          aria-label="Bio"
          @input="markModified"
      ></textarea>

      <small v-if="errors.bio">{{ errors.bio }}</small>

      <div class="btn-actions" v-if="isEditingBio || formModified || avatarFile">
        <button @click="submitUpdate" class="btn-primary">Sauvegarder</button>
        <button @click="resetChanges" class="btn-secondary">Annuler</button>
      </div>
    </div>
  </section>

  <div class="profile-divider" aria-hidden="true">
    <span></span>
    <img src="/icons/map.svg" alt="" />
    <span></span>
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
      isEditingBio: false,
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
          this.isEditingBio = false;

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
    startBioEditing() {
      this.isEditingBio = true;
    },
    resetChanges() {
      if (this.user) {
        this.form.pseudo = this.user.pseudo;
        this.form.bio = this.user.bio || '';
        this.avatarPreview = this.user.avatar_url ? `${this.apiBaseUrl}${this.user.avatar_url}` : '/logo_mobile_pangeas.png';
        this.avatarFile = null;
        this.errors = {};
        this.formModified = false;
        this.isEditingBio = false;
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
.profile-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 54rem;
  margin: 0 auto;
  padding: 1.25rem 0 2.75rem;
  text-align: center;
}

.avatar-control {
  position: relative;
  width: 8rem;
  height: 8rem;
  margin-bottom: 1rem;
}

.avatar-frame {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border: 4px solid var(--color-pangeas-surface-strong);
  border-radius: 50%;
  background: var(--color-pangeas-primary-soft);
  box-shadow: 0 10px 26px rgba(68, 42, 34, 0.16);
  cursor: pointer;
}

.avatar-frame > img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-edit {
  position: absolute;
  right: 0.05rem;
  bottom: 0.2rem;
  display: grid;
  place-items: center;
  width: 2.45rem;
  height: 2.45rem;
  border: 2px solid var(--color-pangeas-bg);
  border-radius: 999px;
  background: var(--color-pangeas-primary-soft);
  box-shadow: 0 4px 12px rgba(68, 42, 34, 0.18);
}

.avatar-edit img {
  width: 1.05rem;
  filter: brightness(0) invert(1);
}

.profile-hero h2 {
  max-width: 100%;
  color: var(--color-pangeas-primary);
  font-size: clamp(2rem, 8vw, 3rem);
  line-height: 1.1;
  overflow-wrap: anywhere;
}

.profile-hero p {
  margin-top: 0.35rem;
  color: var(--color-pangeas-muted);
  font-size: 1rem;
}

.profile-badges {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.2rem;
}

.profile-badges span {
  padding: 0.32rem 0.9rem;
  border-radius: 999px;
  background: var(--color-pangeas-cream);
  color: var(--color-pangeas-muted);
  font-size: 0.72rem;
  font-weight: 900;
  line-height: 1;
  text-transform: uppercase;
}

.profile-badges .level {
  background: var(--color-pangeas-green);
  color: #18362a;
}

.profile-bio-card {
  width: min(100%, 34rem);
  margin-top: 1.35rem;
  padding: 1rem;
  border: 1px solid rgba(212, 195, 190, 0.58);
  border-radius: 0.6rem;
  background: rgba(247, 243, 238, 0.82);
  box-shadow: 0 8px 30px rgba(68, 42, 34, 0.055);
  text-align: left;
}

.bio-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.55rem;
  color: var(--color-pangeas-primary);
  font-weight: 900;
}

.bio-heading button {
  display: grid;
  place-items: center;
  width: 2.15rem;
  height: 2.15rem;
  border-radius: 999px;
  transition: background 0.2s ease, transform 0.2s ease;
}

.bio-heading button:hover {
  background: rgba(68, 42, 34, 0.07);
  transform: translateY(-1px);
}

.bio-heading img {
  width: 1rem;
  height: 1rem;
  opacity: 0.68;
}

.profile-bio-card p {
  color: #3f3530;
  font-size: 0.95rem;
  line-height: 1.55;
  text-align: center;
}

.profile-bio-card p.empty {
  color: var(--color-pangeas-muted);
  font-style: italic;
}

.profile-bio-card textarea {
  width: 100%;
  min-height: 7rem;
  padding: 0.85rem 1rem;
  border: 1px solid rgba(212, 195, 190, 0.95);
  border-bottom-width: 2px;
  border-radius: 0.5rem 0.5rem 0 0;
  outline: 0;
  background: var(--color-pangeas-bg);
  color: #1c1c19;
  font: inherit;
  font-weight: 800;
  line-height: 1.45;
  resize: vertical;
}

.profile-bio-card small {
  display: block;
  margin-top: 0.4rem;
  color: var(--color-pangeas-danger);
  font-size: 0.82rem;
  font-weight: 800;
}

.profile-divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  max-width: 54rem;
  margin: 0 auto 3.25rem;
  opacity: 0.38;
}

.profile-divider span {
  flex: 1;
  height: 1px;
  background: var(--color-pangeas-line);
}

.profile-divider img {
  width: 1.35rem;
  opacity: 0.75;
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
