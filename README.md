### Manual dependencies (/dep/)

`oauth` & `passport-twitch`: patched to support twitch's new API  

# Installation

### Requirements
* node.js
* yarn (not required but recommended)
* mysql

### Steps
* Run `yarn install` (You may have errors installing `node-canvas`, follow the instructions here: [https://github.com/Automattic/node-canvas](https://github.com/Automattic/node-canvas)).
* Copy `.env.exemple` and rename it to `.env`.
* Set `COOKIE_SECRET` to a random string (that will be used for encrypting cookies).
###### Database.
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
INSERT INTO case_content (name, image, chance, contentType, amountPoints, amountMeteores, caseTypeId) VALUES ('100', '/img/case/coin1.png', 200, 'points_and_meteores', 100, 0, 1);
INSERT INTO case_content (name, image, chance, contentType, amountPoints, amountMeteores, caseTypeId) VALUES ('500', '/img/case/coin2.png', 200, 'points_and_meteores', 500, 0, 1);
INSERT INTO case_content (name, image, chance, contentType, amountPoints, amountMeteores, caseTypeId) VALUES ('1000', '/img/case/coin3.png', 200, 'points_and_meteores', 1000, 0, 1);
INSERT INTO case_content (name, image, chance, contentType, amountPoints, amountMeteores, caseTypeId) VALUES ('2000', '/img/case/coin4.png', 200, 'points_and_meteores', 2000, 0, 1);
INSERT INTO case_content (name, image, chance, contentType, amountPoints, amountMeteores, caseTypeId) VALUES ('Clé steam', '/img/case/coin4.png', 200, 'steam_key', 0, 0, 1);
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
###### Paypal (optional, but required for the subscription part of the site)
* Create a sandbox paypal app [https://developer.paypal.com/developer/applications](https://developer.paypal.com/developer/applications).
* Set `PAYPAL_CLIENT_ID` and `PAYPAL_SECRET` to the client id and secret respectively.
* Using the API create 2 products and 2 plans (for VIP and diamond) (More info coming soon™). 
* Set `VIP_PLAN_ID` and `DIAMOND_PLAN_ID` to the id the paypal VIP plan and paypal diamond plan respectively.
       
     

