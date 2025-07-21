<template>
  <SuccessPopup v-if="showSuccessPopup" :message="successMessage" @closed="showSuccessPopup = false"/>
  <ErrorPopup v-if="showErrorPopup" :message="errorMessage" @closed="showErrorPopup = false"/>
  <div class="edit-account">
    <!-- Avatar -->
    <div class="avatar-upload relative w-32 h-32 mx-auto mb-4">
      <label for="avatarInput" class="cursor-pointer block w-full h-full relative group">
        <img :src="avatarPreview" alt="Avatar" class="rounded-full w-full h-full object-cover border border-gray-300 shadow-sm transition-transform duration-200 group-hover:scale-105"/>
        <div class="absolute inset-0 bg-black bg-opacity-20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <img src="/icons/pen.svg" alt="Modifier" class="w-6 h-6" />
        </div>
        <input type="file" id="avatarInput" class="hidden" @change="handleAvatarChange" accept="image/*" />
      </label>
      <p v-if="errors.avatar" class="text-red-500 text-sm mt-2 text-center">{{ errors.avatar }}</p>
    </div>

    <!-- Pseudo -->
    <div class="mt-4 relative">
      <label for="pseudo">Pseudo</label>
      <input id="pseudo" v-model="form.pseudo" class="input pr-10" type="text" placeholder="Ton pseudo"/>
      <span class="absolute right-2 top-[36px] opacity-60">
        <img src="/icons/pen.svg" alt="Modifier le pseudo" class="w-4 h-4" />
      </span>
      <p v-if="errors.pseudo" class="text-red-500 text-sm mt-1">{{ errors.pseudo }}</p>
    </div>

    <!-- Bio -->
    <div class="mt-4 relative">
      <label for="bio">Bio</label>
      <textarea id="bio" v-model="form.bio" class="textarea pr-10" rows="3" placeholder="Je suis..."></textarea>
      <span class="absolute right-2 top-[56px] opacity-60">
        <img src="/icons/pen.svg" alt="Modifier la bio" class="w-4 h-4" />
      </span>
      <p v-if="errors.bio" class="text-red-500 text-sm mt-1">{{ errors.bio }}</p>
    </div>

    <button @click="submitUpdate" class="btn-primary mt-6">Sauvegarder</button>
  </div>
</template>


<script>
import SuccessPopup from "../Modal/SuccessPopup.vue";
import ErrorPopup from "../Modal/ErrorPopup.vue";

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
      errorMessage: ""
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
        const response = await fetch('/api/auth/update', {
          method: 'PUT',
          body: formData
        });
        const data = await response.json();

        if (data.success) {
          this.$emit('updateUser', data.user);

          this.errors = {};

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
.input {
  border: 1px solid #ccc;
  padding: 8px;
  border-radius: 0.5rem;
  width: 100%;
}
.textarea {
  border: 1px solid #ccc;
  padding: 8px;
  border-radius: 0.5rem;
  width: 100%;
  resize: vertical;
}
.btn-primary {
  background-color: #3490dc;
  color: white;
  padding: 10px 16px;
  border-radius: 0.5rem;
  font-weight: bold;
  width: 100%;
}
.avatar-upload img {
  transition: transform 0.2s ease;
}
</style>
