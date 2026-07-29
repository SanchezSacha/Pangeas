<template>
  <div class="legal-container">
    <button class="legal-back-top" type="button" aria-label="Retour" @click="goBack">
      <img src="/icons/arrow-left.svg" alt="" aria-hidden="true" />
    </button>

    <h1 class="text-center">Mentions Légales</h1>
    <p class="date-update text-center pb-4"><strong>Dernière mise à jour : 21 août 2025</strong></p>

    <section>
      <h2>1. Éditeur du site</h2>
      <p>
        Le site <strong>PANGEAS</strong> est développé dans le cadre d’un projet personnel à visée pédagogique,
        sous la responsabilité de <strong>SANCHEZ Sacha</strong>, dans le cadre de l’école <strong>Need For School</strong>.
        <br />
        Adresse de l’établissement : <strong>10 rue Général Sarrail, 76000 Rouen</strong><br />
        Adresse email de contact : <strong><a href="mailto:pangeas@contact.fr">pangeas@contact.fr</a></strong>
      </p>
    </section>

    <section>
      <h2>2. Hébergement</h2>
      <p>
        Le site est hébergé sur les serveurs de l’école <strong>Need For School</strong>, via une infrastructure Apache.
        <br />
        Adresse de l’hébergeur : <strong>10 rue Général Sarrail, 76000 Rouen</strong>
      </p>
    </section>

    <section>
      <h2>3. Propriété intellectuelle</h2>
      <p>
        L’ensemble du contenu du site <strong>PANGEAS</strong> (code, logo, structure, textes, styles) est protégé au titre du droit de la propriété intellectuelle.
        Toute reproduction, représentation, modification, publication, adaptation, même partielle, sans autorisation écrite préalable est strictement interdite.
        <br />
        Le code source est hébergé de manière sécurisée sur un dépôt GitHub privé. L’identité visuelle, bien que non déposée, est considérée comme appartenant exclusivement à l’auteur.
      </p>
    </section>

    <section>
      <h2>4. Conditions d’utilisation</h2>
      <p>
        L’utilisateur s’engage à utiliser le site dans le respect des <router-link to="/cgu">Conditions Générales d’Utilisation</router-link>.
        Toute activité illicite, abusive ou irrespectueuse du fonctionnement du site ou des autres utilisateurs pourra entraîner des sanctions, y compris la suppression de compte.
        <br />
        L’accès à certaines fonctionnalités du site nécessite la création d’un compte ainsi que l’activation de la géolocalisation. Le site est gratuit, sans publicité ni achat intégré.
      </p>
    </section>

    <section>
      <h2>5. Responsabilité</h2>
      <p>
        L’auteur de PANGEAS ne saurait être tenu responsable d’un mauvais usage du site, d’erreurs techniques, de contenus extérieurs ou de dommages indirects causés à l’utilisateur.
        <br />
        En cas de bug ou de problème technique, un contact est possible via l’adresse suivante :
        <strong><a href="mailto:pangeas@contact.fr">pangeas@contact.fr</a></strong>.
      </p>
    </section>

    <section>
      <h2>6. Droit applicable</h2>
      <p>
        Les présentes mentions légales sont régies par le droit français. En cas de litige, les parties s’efforceront de trouver une solution amiable.
        À défaut, le litige pourra être porté devant le tribunal compétent.
      </p>
    </section>
    <button class="btn back-button" @click="goBack">Retour</button>
  </div>
</template>

<script>
export default {
  name: "MentionsLegales",
  mounted() {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
  },
};
</script>

<style scoped>
.legal-container {
  min-height: 100vh;
  background-color: var(--color-beige);
  color: var(--color-brown);
  padding: 5.25rem 2rem calc(7rem + env(safe-area-inset-bottom));
  line-height: 1.7;
}

.legal-back-top {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 40;
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 999px;
  background: rgba(253, 249, 244, 0.92);
  border: 1px solid rgba(212, 195, 190, 0.65);
  box-shadow: 0 8px 24px rgba(68, 42, 34, 0.12);
  backdrop-filter: blur(10px);
  transition: background 0.2s ease, transform 0.2s ease;
}

.legal-back-top:hover {
  background: #f7f3ee;
  transform: translateX(-2px);
}

.legal-back-top img {
  width: 1.2rem;
  height: 1.2rem;
}

h1, h2 {
  margin-top: 1.5rem;
  margin-bottom: 1rem;
}

a {
  color: var(--color-brown);
  text-decoration: underline;
}

.back-button {
  margin: 2rem 0;
  color: var(--color-beige);
  font-size: 1rem;
  cursor: pointer;
  font-weight: bold;
  background-color: var(--color-brown);
  border: 3px solid transparent;
  transition: all 0.2s ease;
}

.back-button:hover {
  background-color: var(--color-beige);
  color: var(--color-brown);
  border: 3px solid var(--color-brown);
}

@media (max-width: 520px) {
  .legal-container {
    padding-inline: 1.25rem;
  }
}
</style>
