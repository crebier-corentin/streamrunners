### Manual dependencies (/dep/)

`oauth` & `passport-twitch`: patched to support twitch's new API  

# Commands
`yarn run asset:dev`, `yarn run asset:development`: Generate frontend assets using development configuration (no minification, no purge-css...).  
`yarn run asset:watch`: Generate frontend assets using development configuration (no minification, no purge-css...) and watch for changes.  
`yarn run asset:prod`, `yarn run asset:production`: Generate frontend assets using production configuration (minification, purge-css...).  

`yarn run docs`: Generate docs/ using typedoc.  
`yarn run format`: Format the backend code using prettier.  
`yarn run lint`: Lint the backend code using eslint.  

`yarn run prebuild`: Delete dist/.  
`yarn run build`: Build the backend app.  

`yarn run start`: Start the backend app.  
`yarn run start:dev`: Start the backend app and watch for changes.  
`yarn run start:debug`: Start the backend app in debug mode and watch for changes.  
`yarn run start:prod`: Start the backend app from file in dist/ (requires `yarn run build` first).  

`yarn run test`: Run backend tests. (.spec.ts files.)  
`yarn run test:cov`: Run backend tests and outputs coverage info in cov/.  

`yarn run typeorm [command]`: Run a [typeorm CLI](https://github.com/typeorm/typeorm/blob/master/docs/using-cli.md) command.  
`yarn run typeorm:gen [MigrationName]`: Generates a new migration in src/migrations based on changes in entities.
**Always manually look and edit the migration files,** typeorm has a tendency to include some useless and/or destructive stuff.  
`yarn run typeorm:run`: Apply migrations to the database.  

**Note:** The pre-commit git hook runs `test`, `format`, `lint`, `asset:production`, `docs` and `git add -u` (adds all the changes to the commit).  
You can bypass it with `-n`. (`git commit -n -m "commit message`.)

# Installation

### Requirements
* node.js
* yarn (not required but recommended)
* mysql

### Steps
* Run `yarn install` (You may have errors installing `node-canvas`, follow the instructions here: [https://github.com/Automattic/node-canvas](https://github.com/Automattic/node-canvas)).
* Copy `.env.exemple` and rename it to `.env`.
* Set `COOKIE_SECRET` to a random string (that will be used for encrypting cookies).
###### Database
* Create a new database with `utf8mb4_unicode_ci` collation.
* Set `DB_HOST` to your database address (most likely `localhost`).
* Set `DB_USERNAME` and `DB_PASSWORD` to your database username and password respectively.
* Set `DB` to the name of the previously created database.
* Run `yarn run typeorm:run` to apply migrations.
* Insert a row into `case_type` to create the affiliated case. Example: 
```SQL
INSERT INTO case_type (name, openImage, closeImage, buyable, price) VALUES ('affiliate', '/img/case/affiliate/open.png', '/img/case/affiliate/close.png', FALSE, 100);
```
* Insert a row into `case_content` to create a content for the affiliated case. Example (assuming the id of the affiliated case is 1):
```SQL
INSERT INTO case_content (name, image, chance, keyCategory, amountPoints, amountMeteores, caseTypeId) VALUES ('100', '/img/case/coin1.png', 200, NULL, 100, 0, 1);
INSERT INTO case_content (name, image, chance, keyCategory, amountPoints, amountMeteores, caseTypeId) VALUES ('500', '/img/case/coin2.png', 200, NULL, 500, 0, 1);
INSERT INTO case_content (name, image, chance, keyCategory, amountPoints, amountMeteores, caseTypeId) VALUES ('1000', '/img/case/coin3.png', 200, NULL, 1000, 0, 1);
INSERT INTO case_content (name, image, chance, keyCategory, amountPoints, amountMeteores, caseTypeId) VALUES ('2000', '/img/case/coin4.png', 200, NULL, 2000, 0, 1);
INSERT INTO case_content (name, image, chance, keyCategory, amountPoints, amountMeteores, caseTypeId) VALUES ('Clé steam', '/img/case/coin4.png', 200, 'random', 0, 0, 1);
```
* Set `AFFILIATE_CASE_ID` to the id of the affiliated case.
###### Twitch
* Create an app on twitch [https://dev.twitch.tv/](https://dev.twitch.tv/).
* Set the callback url to `http://127.0.0.1:3000/auth/twitch/callback` (it must be equal to HOSTNAME + /auth/twitch/callback).
* Set `TWITCH_CLIENT_ID` and `TWITCH_CLIENT_SECRET` to the twitch client id and secret respectively.
###### Discord
* Create an app on discord [https://discord.com/developers/applications](https://discord.com/developers/applications).
* Click on the `Bot` tab and on `Add Bot` button.
* Set `DISCORD_TOKEN` to the bot's token.
* On the discord **desktop app**, go to the settings > Appearance > Advanced > check developer mode.
* Create a new discord server .
* For `SITE_USER_COUNT_CHANNEL_ID`, `DISCORD_MEMBER_COUNT_CHANNEL_ID` and `RAFFLE_VALUE_CHANNEL_ID` create a vocal channel and copy its id (right click on the channel -> copy id).
* For `STREAM_NOTIFICATION_ROLE_ID` and `RAFFLE_NOTIFICATION_ROLE_ID` create a role and copy its id  (be careful to copy the id of the role and not the id of a message or an user).
* For `STREAM_NOTIFICATION_CHANNEL_ID` and `RAFFLE_NOTIFICATION_CHANNEL_ID` create a text channel and copy its id.
###### Mail
The site uses [nodemailer](https://nodemailer.com/about/).  
* Set `MAIL_SMTP_ADDRESS` to the email address you want to use. (Might be different from the username.)
* Set `MAIL_SMTP_HOST` and `MAIL_SMTP_PORT` to the SMTP server host and port respectively.
* Set `MAIL_SMTP_SECURE` to `true` or `false`. (Usually `true` if the port is 465.)
* Set `MAIL_SMTP_USER` and `MAIL_SMTP_PASSWORD` to the username and password for your email account.
###### Recaptcha
###### Dev
* Set `RECAPTCHA_PUBLIC` to `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`
* Set `RECAPTCHA_SECRET` to `6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe`
###### Prod
* Register a recaptcha v2 checkbox application [https://www.google.com/recaptcha/admin](https://www.google.com/recaptcha/admin).
* Set `RECAPTCHA_PUBLIC` and `RECAPTCHA_SECRET` to the public token and secret token respectively.
###### Paypal (optional, but required for the subscription part of the site)
* Create a sandbox paypal app [https://developer.paypal.com/developer/applications](https://developer.paypal.com/developer/applications).
* Set `PAYPAL_CLIENT_ID` and `PAYPAL_SECRET` to the client id and secret respectively.
* Using the API create 2 products and 2 plans (for VIP and diamond) [https://developer.paypal.com/docs/api/catalog-products/v1/](https://developer.paypal.com/docs/api/catalog-products/v1/) [https://developer.paypal.com/docs/api/subscriptions/v1/#plans_create](https://developer.paypal.com/docs/api/subscriptions/v1/#plans_create). 
* Set `VIP_PLAN_ID` and `DIAMOND_PLAN_ID` to the id the paypal VIP plan and paypal diamond plan respectively.
       
     

