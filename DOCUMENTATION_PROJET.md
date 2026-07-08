# Documentation du projet Pangeas

## Vue d'ensemble

Pangeas est une application web front-end construite avec Vue 3 et Vite. Elle propose une carte interactive de lieux a decouvrir, un espace utilisateur, une gestion des favoris et des visites, ainsi qu'une interface d'administration pour gerer les utilisateurs, les lieux et les statistiques.

Le code applicatif se trouve principalement dans le dossier `pangeas-v1`.

## Informations generales

| Element | Valeur |
| --- | --- |
| Nom du package | `pangeas-v1` |
| Version applicative | `0.0.0` |
| Type de projet | Application web front-end |
| Framework principal | Vue 3 |
| Bundler / serveur de developpement | Vite |
| Gestionnaire de paquets | npm |
| Fichier de verrouillage | `package-lock.json` |
| Version du lockfile | `3` |

## Versions des langages et environnements

| Technologie | Version / indication |
| --- | --- |
| JavaScript | Modules ES, via `"type": "module"` |
| Vue | `^3.5.13` |
| Node.js | Non fixe dans le projet |
| npm | Non fixe dans le projet |
| Node.js observe localement | `v24.13.1` |
| npm observe localement | `11.8.0` |
| HTML | HTML5, via `index.html` |
| CSS | CSS classique, Tailwind CSS et Bootstrap |

> Remarque : aucune version Node.js n'est imposee dans `package.json` via un champ `engines`. Pour stabiliser les installations entre machines, il serait possible d'ajouter un fichier `.nvmrc` ou une section `engines`.

## Scripts disponibles

Les scripts sont declares dans `pangeas-v1/package.json`.

| Commande | Role |
| --- | --- |
| `npm run dev` | Lance le serveur de developpement Vite |
| `npm run build` | Genere la version de production |
| `npm run preview` | Lance une previsualisation locale du build |

## Dependances principales

| Dependances | Version | Usage principal |
| --- | --- | --- |
| `vue` | `^3.5.13` | Framework front-end |
| `vue-router` | `^4.5.1` | Navigation et routes |
| `vuex` | `^4.1.0` | Etat global de l'application |
| `axios` | `^1.9.0` | Appels HTTP vers l'API |
| `leaflet` | `^1.9.4` | Carte interactive |
| `leaflet-routing-machine` | `^3.2.12` | Itineraires sur la carte |
| `haversine-distance` | `^1.2.4` | Calcul de distance geographique |
| `chart.js` | `^3.9.1` | Graphiques statistiques |
| `vue-chartjs` | `^4.1.2` | Integration Chart.js avec Vue |
| `bootstrap` | `^5.3.6` | Styles et composants CSS |
| `flowbite` | `^3.1.2` | Composants UI compatibles Tailwind |
| `sweetalert2` | `^11.22.3` | Popups et alertes |
| `lucide-static` | `^0.515.0` | Icones statiques |

## Dependances de developpement

| Dependances | Version | Usage principal |
| --- | --- | --- |
| `vite` | `^6.3.5` | Build et serveur de developpement |
| `@vitejs/plugin-vue` | `^5.2.3` | Support Vue dans Vite |
| `vite-plugin-pwa` | `^1.0.2` | Fonctionnalites PWA |
| `tailwindcss` | `^4.1.11` | Framework CSS utilitaire |
| `@tailwindcss/postcss` | `^4.1.11` | Integration Tailwind avec PostCSS |
| `postcss` | `^8.5.6` | Transformation CSS |
| `autoprefixer` | `^10.4.21` | Prefixes CSS automatiques |

## Structure du projet

```text
Pangeas/
├── README.md
└── pangeas-v1/
    ├── package.json
    ├── package-lock.json
    ├── vite.config.js
    ├── index.html
    ├── public/
    │   ├── icons/
    │   ├── sb-admin2/
    │   └── logos et images publiques
    └── src/
        ├── admin/
        ├── assets/
        ├── charts/
        ├── components/
        ├── layout/
        ├── router/
        ├── store/
        ├── App.vue
        ├── HomeView.vue
        ├── axios.js
        ├── main.js
        └── style.css
```

## Repartition des fichiers source

| Type de fichier | Nombre observe |
| --- | --- |
| Composants Vue (`.vue`) | 41 |
| Fichiers JavaScript (`.js`) | 4 |
| Fichiers CSS (`.css`) | 4 |

## Configuration importante

### Vite

Le fichier `pangeas-v1/vite.config.js` configure :

- Vue via `@vitejs/plugin-vue`.
- Une Progressive Web App via `vite-plugin-pwa`.
- Un alias `@` qui pointe vers `src`.
- Un proxy de developpement pour `/api` vers `http://localhost:3000`.

### PWA

La configuration PWA utilise :

- `registerType: 'autoUpdate'`.
- Un manifest avec le theme couleur `#5D4037`.
- Des icones basees sur les logos mobiles.
- Une strategie de cache `NetworkFirst` pour certaines routes API locales.

### API

Les appels HTTP passent principalement par `src/axios.js`, qui configure :

- `withCredentials: true` pour transmettre les cookies/session.
- Un intercepteur qui deconnecte l'utilisateur et le renvoie vers l'accueil en cas de reponse `401`.

Le front-end attend une API accessible sous `/api`, proxifiee localement vers `http://localhost:3000`.

## Routes principales

| Route | Description | Protection |
| --- | --- | --- |
| `/` | Accueil avec carte interactive | Publique |
| `/mon-compte` | Compte utilisateur | Utilisateur connecte |
| `/parametres` | Parametres du compte | Utilisateur connecte |
| `/lieux/:id` | Detail d'un lieu | Publique |
| `/cgu` | Conditions generales d'utilisation | Publique |
| `/confidentialite` | Politique de confidentialite | Utilisateur connecte |
| `/mentions-legales` | Mentions legales | Utilisateur connecte |
| `/admin/dashboard` | Tableau de bord admin | Administrateur |
| `/admin/users` | Gestion des utilisateurs | Administrateur |
| `/admin/users/:id` | Detail d'un utilisateur | Administrateur |
| `/admin/users/:id/edit` | Modification d'un utilisateur | Administrateur |
| `/admin/places` | Gestion des lieux | Administrateur |
| `/admin/places/:id` | Detail d'un lieu cote admin | Administrateur |
| `/admin/places/:id/edit` | Modification d'un lieu | Administrateur |
| `/admin/places/add` | Ajout d'un lieu | Administrateur |

## Fonctionnalites principales

### Carte et lieux

- Affichage des lieux sur une carte Leaflet.
- Detail d'un lieu via une page dediee.
- Modal de lieu depuis la carte.
- Gestion d'itineraire avec `leaflet-routing-machine`.
- Calculs de distance geographique.

### Authentification et session

- Inscription utilisateur.
- Connexion utilisateur.
- Deconnexion.
- Recuperation de l'utilisateur courant via `/api/auth/me`.
- Protection des routes selon l'etat de connexion.
- Protection des routes d'administration selon le role `admin`.

### Compte utilisateur

- Affichage du compte.
- Modification des informations du compte.
- Statistiques personnelles.
- Historique des lieux visites.
- Carousel des favoris.
- Mise a jour de l'email.
- Mise a jour du mot de passe.
- Export des donnees.
- Suppression des donnees utilisateur.
- Suppression du compte.

### Favoris

- Ajout d'un lieu aux favoris.
- Suppression d'un favori.
- Recuperation de la liste des favoris.
- Verification d'un favori via l'etat global Vuex.

### Visites

- Demarrage d'une visite.
- Recuperation d'une visite en cours.
- Annulation d'une visite.
- Validation d'une visite.
- Historique pagine des visites.

### Administration

- Tableau de bord administrateur.
- Statistiques globales.
- Graphiques de categories.
- Top des lieux visites.
- Liste des utilisateurs.
- Detail, modification et suppression d'utilisateurs.
- Liste des lieux.
- Detail, ajout, modification et suppression de lieux.

### Contenus legaux

- Conditions generales d'utilisation.
- Politique de confidentialite.
- Mentions legales.

## Etat global Vuex

Le store contient les donnees suivantes :

| Etat | Role |
| --- | --- |
| `user` | Utilisateur connecte |
| `userPosition` | Position geographique de l'utilisateur |
| `currentVisit` | Visite actuellement en cours |
| `visitPlaceFromDetail` | Lieu selectionne depuis une fiche detail |
| `favorites` | Liste des favoris |

Les getters permettent notamment de savoir si l'utilisateur est connecte, de recuperer son pseudo, sa position et de verifier si un lieu est en favori.

## Principaux endpoints utilises cote front

| Endpoint | Usage |
| --- | --- |
| `/api/accueil` | Chargement des lieux pour l'accueil |
| `/api/auth/me` | Recuperation de l'utilisateur connecte |
| `/api/auth/connexion` | Connexion |
| `/api/auth/inscription` | Inscription |
| `/api/auth/logout` | Deconnexion |
| `/api/places/:id` | Detail d'un lieu |
| `/api/favorites` | Liste ou ajout de favoris |
| `/api/favorites/:placeId` | Suppression d'un favori |
| `/api/visit/ongoing` | Visite en cours |
| `/api/visit/start` | Demarrage d'une visite |
| `/api/visit/cancel` | Annulation d'une visite |
| `/api/visit/validate` | Validation d'une visite |
| `/api/visit/visited` | Historique des visites |
| `/api/stats` | Statistiques utilisateur |
| `/api/settings/export` | Export des donnees |
| `/api/settings/email` | Mise a jour email |
| `/api/settings/password` | Mise a jour mot de passe |
| `/api/settings/data` | Suppression des donnees |
| `/api/settings/delete` | Suppression du compte |
| `/api/admin/users` | Gestion admin des utilisateurs |
| `/api/admin/users/:id` | Detail, modification ou suppression utilisateur |
| `/api/admin/places` | Gestion admin des lieux |
| `/api/admin/places/:id` | Detail, modification ou suppression lieu |
| `/api/admin/places/stats` | Statistiques admin |
| `/api/admin/places/stats/global` | Statistiques globales admin |
| `/api/admin/places/stats/top` | Top des lieux |
| `/api/admin/places/chart/categories` | Donnees de graphique par categories |

## Points d'attention

- Le back-end n'est pas present dans ce depot : le front-end depend d'une API locale exposee sur `http://localhost:3000`.
- La version de Node.js n'est pas verrouillee dans le projet.
- Certaines chaines accentuees semblent mal encodees dans quelques fichiers sources affiches par le terminal. Il peut etre utile de verifier l'encodage des fichiers si ces caracteres apparaissent mal dans l'interface.
- Le README actuel de `pangeas-v1` correspond encore au modele Vue 3 + Vite par defaut.

