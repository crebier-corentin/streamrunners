import { join } from 'path';
import { ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import * as cookieSession from 'cookie-session';
import * as helmet from 'helmet';
import * as nunjucks from 'nunjucks';
import * as passport from 'passport';
import { AnnouncementService } from './announcement/announcement.service';
import { AppModule } from './app.module';
import { ViewFilter } from './common/filter/view.filter';
import { VIEW_DIR_PATH } from './common/utils/constants';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const config = app.get(ConfigService);
    const isDev = config.get('ENV') === 'development';

    const announcementService = app.get(AnnouncementService);

    app.useGlobalFilters(new ViewFilter(isDev));

    //Maintenance
    if (config.get('MAINTENANCE') === 'true') {
        app.use(() => {
            throw new ServiceUnavailableException();
        });
    }

    //Global middlewares
    app.use(helmet());
    app.use(cookieParser());
    app.use(cookieSession({ keys: [config.get('COOKIE_SECRET')] }));

    //Passport
    app.use(passport.initialize());
    app.use(passport.session());

    //Static assets
    app.useStaticAssets(join(__dirname, '..', 'public'));

    //Nunjucks
    nunjucks
        .configure(VIEW_DIR_PATH, {
            watch: isDev,
            noCache: isDev,
            express: app,
        })
        .addGlobal('HOSTNAME', config.get('HOSTNAME'))
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
            true
        );
    app.setViewEngine('nunj');

    //Pass req to template engine
    app.use(async (req, res, next) => {
        res.locals.req = req;
        res.locals.announcement = await announcementService.current();
        next();
    });

    await app.listen(3000);
}

bootstrap();
