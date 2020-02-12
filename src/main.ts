import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as helmet from 'helmet';
import * as nunjucks from 'nunjucks';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const config = app.get(ConfigService);
    const isDev = config.get('ENV') === 'development';

    //Global middlewares
    app.use(helmet());

    //Static assets
    app.useStaticAssets(join(__dirname, '..', 'public'));

    //Nunjucks
    nunjucks
        .configure(join(__dirname, '..', 'views'), {
            watch: isDev,
            noCache: isDev,
            express: app,
        })
        .addGlobal('HOSTNAME', config.get('HOSTNAME'))
        //TODO .addGlobal('LastAnnouncement', Announcement.LastAnnouncement)
        //Await nunjucks (https://www.npmjs.com/package/nunjucks-await-filter)
        .addFilter(
            'await',
            async (functionPromise, callback) => {
                try {
                    // The called function returns a Promise, which we
                    // now `await` until its done
                    const result = await functionPromise;

                    // Then we call the Nunjucks async filter callback
                    callback(null, result);
                } catch (error) {
                    // And if the `functionPromise` throws an error
                    // Nunjucks will pick it up here
                    callback(error);
                }
            },
            true,
        );
    app.setViewEngine('nunj');

    //Pass req to template engine
    app.use((req, res, next) => {
        res.locals.req = req;
        next();
    });

    await app.listen(3000);
}

bootstrap();
