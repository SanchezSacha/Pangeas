<template>
  <div class="legal-container">
    <button class="legal-back-top" type="button" aria-label="Retour" @click="goBack">
      <img src="/icons/arrow-left.svg" alt="" aria-hidden="true" />
    </button>

    <h1 class="text-center pb-4">Politique de Confidentialité</h1>

    <section>
      <h2>1. Responsable du traitement</h2>
      <p>
        Le traitement des données personnelles est réalisé par <strong>SANCHEZ Sacha</strong>, dans le cadre d’un projet d’étude développé au sein de l’école <strong>Need For School</strong>.
        <br />
        Pour toute question ou demande : <strong><a href="mailto:pangeas@contact.fr">pangeas@contact.fr</a></strong>.
      </p>
    </section>

    <section>
      <h2>2. Base légale du traitement</h2>
      <p>Les données personnelles sont traitées sur la base :</p>
      <ul>
        <li><strong>du consentement explicite</strong> de l’utilisateur lors de la création de compte,</li>
        <li><strong>d’un intérêt légitime</strong> (suivi statistique, amélioration de l’expérience utilisateur),</li>
        <li><strong>d’une obligation légale</strong> (transparence sur les données collectées).</li>
      </ul>
      <p>
        La transparence étant une valeur centrale du projet <strong>PANGEAS</strong>, le respect du consentement de l’utilisateur est prioritaire à tout moment.
      </p>
    </section>

    <section>
      <h2>3. Finalités de la collecte</h2>
      <p>Les données sont collectées pour permettre :</p>
      <ul>
        <li>La création et gestion du compte utilisateur (email, pseudo, mot de passe hashé, bio, avatar),</li>
        <li>Le suivi des visites, favoris, paramètres et statistiques personnelles,</li>
        <li>Le calcul temporaire du tracé GPS pour valider les visites, sans conservation de la position,</li>
        <li>L’export, la modification ou la suppression des données à la demande de l’utilisateur.</li>
      </ul>
      <p><strong>Philosophie du projet :</strong></p>
      <p>
        Le projet <strong>PANGEAS</strong> poursuit une ambition centrale : démontrer que la technologie n’est pas nécessairement un frein à la reconnexion au réel, mais qu’elle peut au contraire devenir un moteur d’éveil, de mouvement et de curiosité.
        Inspirée par des modèles comme Pokémon Go, l'application propose de détourner l’usage passif du smartphone pour stimuler l’exploration, l’activité physique et la découverte culturelle.
      </p>
      <p>
        L’application se veut un pont entre deux univers : l’environnement numérique, et l’environnement naturel. À travers une carte stylisée, des lieux immersifs et des défis à relever dans le monde réel, <strong>PANGEAS</strong> redonne du sens à l’usage des outils numériques.
      </p>
      <p>
        Le projet vise aussi à encourager un mode de vie plus actif et plus sain, en valorisant la marche et la découverte de son territoire grâce à une gamification bienveillante.
      </p>
    </section>

    <section>
      <h2>4. Destinataires des données</h2>
      <p>
        Les données collectées ne sont <strong>ni vendues</strong>, <strong>ni cédées</strong> à des tiers. Elles sont exclusivement utilisées dans le cadre du projet <strong>PANGEAS</strong>.
      </p>
    </section>

    <section>
      <h2>5. Durée de conservation</h2>
      <p>
        Les données sont conservées jusqu’à ce que l’utilisateur en demande la suppression via son espace personnel, ou supprime directement son compte. Une demande peut également être faite par mail à <strong><a href="mailto:pangeas@contact.fr">pangeas@contact.fr</a></strong>.
      </p>
    </section>

    <section>
      <h2>6. Droits des utilisateurs</h2>
      <p>Conformément au Règlement Général sur la Protection des Données (RGPD), chaque utilisateur dispose des droits suivants :</p>
      <ul>
        <li><strong>Droit d’accès</strong> à ses données,</li>
        <li><strong>Droit de rectification</strong> ou de suppression,</li>
        <li><strong>Droit d’opposition</strong> ou de limitation du traitement,</li>
        <li><strong>Droit à la portabilité</strong> via l’export au format JSON,</li>
        <li><strong>Droit d’introduire une réclamation</strong> auprès de la CNIL.</li>
      </ul>
      <p>PANGEAS est également attentif à l’<strong>inclusivité</strong> de son interface :</p>
      <ul>
        <li>Contrastes et tailles de police accessibles,</li>
        <li>Structure logique des balises (titres, alt, navigation clavier),</li>
        <li>Utilisation possible à une main sur smartphone.</li>
      </ul>
    </section>

    <section>
      <h2>7. Cookies et traceurs</h2>
      <p>
        Le site <strong>PANGEAS</strong> n’utilise aucun cookie à des fins publicitaires ou de suivi. Seul un cookie de session sécurisé est utilisé pour maintenir la connexion (connect.sid).
        Aucun autre traceur tiers n’est volontairement implémenté.
      </p>
    </section>

    <section>
      <h2>8. Sécurité des données</h2>
      <p>Les données sont protégées par :</p>
      <ul>
        <li>Un système de <strong>sessions sécurisées</strong>,</li>
        <li>Le <strong>hashage des mots de passe</strong>,</li>
        <li>La <strong>non-conservation de la position GPS</strong> en base de données.</li>
      </ul>
      <p>L’accès aux fonctionnalités sensibles est conditionné à une authentification valide.</p>
    </section>

    <section>
      <h2>9. Modifications</h2>
      <p>
        La présente politique peut être modifiée pour s’adapter à l’évolution du projet ou du cadre légal. La dernière mise à jour a été effectuée le <strong>21 août 2025</strong>.
      </p>
    </section>

    <section>
      <h2>10. Litiges et contact</h2>
      <p>
        En cas de litige, une solution amiable sera privilégiée. À défaut, le litige pourra être porté devant le tribunal compétent.
        Pour toute demande, vous pouvez nous contacter à <strong><a href="mailto:pangeas@contact.fr">pangeas@contact.fr</a></strong>.
      </p>
    </section>

    <button class="btn back-button" @click="goBack">Retour</button>
  </div>
</template>

<script>
export default {
  name: "PolitiqueConfidentialite",
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
  margin: 0 auto 1.5rem;
  padding-bottom: 0 !important;
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

p + p,
ul + p {
  margin-top: 0.85rem;
}

ul {
  display: grid;
  gap: 0.55rem;
  margin-top: 0.75rem;
}

li {
  position: relative;
  padding-left: 1.1rem;
  color: #3f3530;
}

li::before {
  content: "";
  position: absolute;
  top: 0.72em;
  left: 0;
  width: 0.38rem;
  height: 0.38rem;
  border-radius: 999px;
  background: var(--color-pangeas-primary-soft);
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
