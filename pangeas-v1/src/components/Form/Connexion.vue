<template>
  <div class="container">
    <h1 class="form-title">Connexion</h1>
    <form class="form-container" @submit.prevent="submitForm()">
      <div class="input-duo">
        <div class="input-group">
                <span class="input-group-text">
                  <img src="/icons/mail.svg" alt="Mail" style="width: 18px;" />
                </span>
          <input type="email" class="form-control" placeholder="Adresse mail *" v-model="form.email" required />
        </div>
        <div class="input-group">
          <span class="input-group-text">
            <img src="/icons/lock.svg" alt="Mot de passe" style="width: 18px;" />
          </span>
          <input type="password" class="form-control" placeholder="Mot de passe *" v-model="form.password" required />

        </div>
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
export default {
  name: "Connexion",
  data() {
    return {
      form: {
        password: "",
        email: "",
      }
    };
  },
  methods: {
    submitForm() {
      console.log("Connexion avec :", this.form);
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
