<template>
  <section class="settings-card shadow">
    <h2 class="section-title">Informations légales & contact</h2>

    <div class="info-line">
      <div class="info-text">
        <strong>Conditions Générales d’Utilisation</strong>
      </div>
      <router-link class="edit-link" to="/cgu">Voir</router-link>
    </div>

    <div class="info-line">
      <div class="info-text">
        <strong>Politique de confidentialité</strong>
      </div>
      <router-link class="edit-link" to="/confidentialite">Voir</router-link>
    </div>

    <div class="info-line">
      <div class="info-text">
        <strong>Mentions légales</strong>
      </div>
      <router-link class="edit-link" to="/mentions-legales">Voir</router-link>
    </div>

    <div class="info-line">
      <div class="info-text">
        <strong>Adresse de contact :</strong>
      </div>
      <a href="mailto:pangeas@contact.fr" class="edit-link">pangeas@contact.fr</a>
    </div>
  </section>
</template>


<script>
export default {
  name: "SettingsLegalInfo"
};
</script>

<style scoped>
.settings-card {
  background-color: var(--color-beige);
  border: 4px solid var(--color-brown);
  color: var(--color-brown);
  border-radius: 8px;
  padding: 2rem;
  margin: 4rem 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.section-title {
  color: var(--color-brown);
  font-size: 1.6rem;
  margin-bottom: 2rem;
}

.info-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
  gap: 0.5rem;
}

.info-text {
  flex: 1 1 70%;
  display: flex;
  flex-direction: column;
  font-size: 1rem;
}

.edit-link {
  color: var(--color-blue);
  font-weight: bold;
  transition: transform 0.2s ease, color 0.2s ease;
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
}

.edit-link:hover {
  transform: scale(1.05);
}

/* Responsive mobile */
@media (max-width: 600px) {
  .settings-card {
    padding: 1.5rem;
  }

  .info-line {
    flex-direction: column;
    align-items: flex-start;
  }

  .info-text {
    width: 100%;
  }

  .edit-link {
    align-self: flex-end;
    margin-top: 0.5rem;
  }

  .section-title {
    font-size: 1.4rem;
    text-align: center;
  }
}
</style>

