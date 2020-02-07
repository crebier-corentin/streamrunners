# TwitchRunner

### Installation

Pour node-canvas : regarder les instructions https://www.npmjs.com/package/canvas

* `yarn install`
* Renommée `.env.exemple` en `.env` et remplir le fichier
* Créer un base de données mysql utf8mb4_unicode_ci

### Comandes

* Lancer le serveur : `npm start`

* Compiler sass et js dev : `npm run dev`  
* Compiler sass et js dev watch : `npm run watch`  
* Compiler sass et js prod : `npm run prod`  

### Migration

* Générer les migrations depuis les entité (Exécuter migration:run avant): `migration:generate -- -n NomDeLaMigration`
* Effectue les migrations: `migration:run`
* Annule les migrations : `migration:revert`
