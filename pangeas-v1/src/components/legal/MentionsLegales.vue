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
  background: var(--color-pangeas-bg);
  color: var(--color-auth-text);
  padding: 5.75rem 1rem calc(7rem + env(safe-area-inset-bottom));
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
  background: rgba(253, 249, 244, 0.94);
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

h1 {
  width: min(100%, 52rem);
  margin: 0 auto 0.5rem;
  color: var(--color-pangeas-primary);
  font-size: clamp(2rem, 8vw, 3.2rem);
  line-height: 1.08;
}

h1::before {
  content: "";
  display: block;
  width: 4.35rem;
  height: 4.35rem;
  margin: 0 auto 1rem;
  background: url("/logo_mobile_pangeas.png") center / contain no-repeat;
}

.date-update {
  width: min(100%, 52rem);
  margin: 0 auto 1.5rem;
  color: var(--color-pangeas-muted);
  font-size: 0.92rem;
}

section {
  width: min(100%, 52rem);
  margin: 0 auto 1rem;
  padding: 1.2rem;
  border: 1px solid rgba(212, 195, 190, 0.58);
  border-radius: 0.6rem;
  background: var(--color-pangeas-surface);
  box-shadow: var(--shadow-pangeas-card);
}

h2 {
  margin: 0 0 0.75rem;
  color: var(--color-pangeas-primary);
  font-size: 1.15rem;
  line-height: 1.25;
}

a {
  color: var(--color-pangeas-primary);
  font-weight: 900;
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 0.16em;
}

.back-button {
  display: flex;
  justify-content: center;
  width: min(100%, 14rem);
  min-height: 3rem;
  margin: 2rem auto 0;
  color: #fff;
  font-size: 1rem;
  font-weight: 900;
  background: var(--color-pangeas-primary);
  border: 2px solid var(--color-pangeas-primary);
  border-radius: 999px;
  transition: transform 0.2s ease, background 0.2s ease;
}

.back-button:hover {
  background: var(--color-pangeas-primary-soft);
  transform: translateY(-1px);
}

@media (max-width: 520px) {
  .legal-container {
    padding-inline: 0.9rem;
  }

  section {
    padding: 1rem;
  }
}
</style>
