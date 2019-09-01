# TwitchRunner

### Installation
* `npm install`
* Renommée `.env.exemple` en `.env` et remplir le fichier
* Créer un fichier vide nommé `database.sqlite`

### Comandes

* Lancer le serveur : `npm start`

* Compiler sass et js prod : `npm run build`  
* Compiler sass : `npm run build:sass`  
* Compiler js dev : `npm run build:js:dev`  
* Compiler js prod : `npm run build:js`  

### Migration


* Générer les migrations depuis les entité (Exécuter migration:run avant): `migration:generate -- -n NomDeLaMigration`
* Effectue les migrations: `migration:run`
* Annule les migrations : `migration:revert`