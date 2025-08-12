<template>
  <div class="cgu-container">
    <h1 class="text-center">Conditions Générales d’Utilisation</h1>
    <p class="date-update text-center pb-4"><strong>Dernière mise à jour : 21 août 2025</strong></p>

    <section>
      <h2>1. Présentation de PANGEAS</h2>
      <p>
        <strong>PANGEAS</strong> est une application personnelle développée pour permettre aux utilisateurs, en particulier les jeunes adultes,
        de <strong>découvrir des lieux d’intérêt</strong> en France, d’en apprendre davantage sur eux et d’effectuer un suivi de leurs visites.
        L’application est actuellement <strong>gratuite</strong>, sans publicités ni achats intégrés.
      </p>
    </section>

    <section>
      <h2>2. Acceptation des CGU</h2>
      <p>
        En créant un compte ou en accédant aux services proposés par PANGEAS, l’utilisateur reconnaît avoir lu, compris et accepté les présentes Conditions Générales d’Utilisation.
      </p>
    </section>

    <section>
      <h2>3. Accès aux services</h2>
      <p>
        L’utilisateur peut consulter les lieux disponibles sans être connecté. Cependant, pour accéder à l’ensemble des fonctionnalités
        (visites, statistiques, favoris, paramètres...), <strong>la création d’un compte et l’activation de la géolocalisation</strong> sont obligatoires.
      </p>
    </section>

    <section>
      <h2>4. Utilisation responsable</h2>
      <p>L’utilisateur s’engage à :</p>
      <ul>
        <li>Respecter les lieux visités, leur environnement naturel, les animaux et les personnes qui les entretiennent</li>
        <li>Ne pas utiliser l’application à des fins illégales, frauduleuses ou abusives</li>
        <li>Ne pas perturber le bon fonctionnement de la plateforme (spam, surcharges, fausses visites, etc.)</li>
      </ul>
    </section>

    <section>
      <h2>5. Données personnelles</h2>
      <p>
        PANGEAS collecte les données suivantes : <strong>email, pseudo, avatar, bio, mot de passe hashé</strong>, préférences, favoris, statistiques,
        historique de visites, état des visites, données de modification/inscription. Aucune <strong>position GPS</strong> n’est stockée en base de données,
        elle est uniquement utilisée temporairement lors d’une visite.
      </p>
      <p>
        L’utilisateur peut <strong>exporter ses données</strong> au format JSON, <strong>supprimer tout ou partie</strong> de ses données, ou bien
        supprimer complètement son compte, ce qui effacera toutes les informations en base.
      </p>
    </section>

    <section>
      <h2>6. Sécurité</h2>
      <p>
        Les sessions sont sécurisées, les mots de passe sont <strong>cryptés et hashés</strong>. Un système de vérification est en place
        pour accéder aux zones sensibles de l’application. En cas de problème technique, vous pouvez contacter :
        <strong><a href="mailto:pangeas@contact.fr">pangeas@contact.fr</a></strong>.
      </p>
    </section>

    <section>
      <h2>7. Propriété intellectuelle</h2>
      <p>
        Le code source est protégé via un dépôt GitHub privé. Toute tentative de <strong>plagiat, hacking, détournement</strong> ou reproduction non autorisée du projet
        pourra faire l’objet de poursuites. Le nom <strong>PANGEAS</strong>, son concept, son logo, ainsi que l’architecture de l’application sont protégés.
      </p>
      <p>
        L’utilisateur est autorisé à partager ses contenus (statistiques, lieux visités, etc.) dans un cadre personnel et non commercial.
      </p>
    </section>

    <section>
      <h2>8. Limitations de responsabilité</h2>
      <p>Le développeur de PANGEAS ne peut être tenu responsable :</p>
      <ul>
        <li>Des dommages ou comportements engendrés par des tiers lors d’une visite</li>
        <li>Des erreurs de données ou de localisation</li>
        <li>Des interruptions de service</li>
      </ul>
      <p>
        En cas de bug ou d’anomalie, veuillez écrire à : <strong>pangeas@contact.fr</strong>.
      </p>
    </section>

    <section>
      <h2>9. Sanctions en cas de non-respect</h2>
      <p>
        En cas de violation des présentes CGU ou de comportement inapproprié, le développeur de PANGEAS se réserve le droit de
        <strong>suspendre ou supprimer un compte utilisateur</strong>, sans préavis.
      </p>
    </section>

    <section>
      <h2>10. Modifications des CGU</h2>
      <p>
        Les présentes CGU peuvent être modifiées à tout moment. En cas de modification majeure, la date sera mise à jour et les utilisateurs pourront en être informés.
        Il est recommandé de les consulter régulièrement.
      </p>
    </section>

    <section>
      <h2>11. Droit applicable et litiges</h2>
      <p>
        Les présentes CGU sont soumises au droit français. En cas de litige, et à défaut de solution amiable, l’affaire pourra être portée devant le tribunal compétent.
      </p>
    </section>

    <section>
      <h2>12. Contact</h2>
      <p>
        Pour toute question ou signalement, vous pouvez écrire à : <strong><a href="mailto:pangeas@contact.fr">pangeas@contact.fr</a></strong>
      </p>
    </section>

    <button class="btn back-button" @click="goBack">Retour</button>
  </div>
</template>

<script>
export default {
  name: 'Cgu',
  methods: {
    goBack() {
      this.$router.go(-1)
    }
  }
}
</script>

<style scoped>
.cgu-container {
  background-color: var(--color-beige);
  color: var(--color-brown);
  padding: 2rem;
  line-height: 1.7;
}

h1, h2, h3 {
  margin-top: 1.5rem;
  margin-bottom: 1rem;
}

.back-button {
  margin: 2rem 0;
  color: var(--color-beige);
  font-size: 1rem;
  cursor: pointer;
  font-weight: bold;
  background-color: var(--color-brown);
  border: 3px solid transparent;
  border-radius: 5px;
  transition: all 0.2s ease;
}

.back-button:hover {
  background-color: var(--color-beige);
  color: var(--color-brown);
  border: 3px solid var(--color-brown);
}

a {
  color: var(--color-brown);
  text-decoration: underline;
}
</style>
