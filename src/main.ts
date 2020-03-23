import { join } from 'path';
import { ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import * as cookieSession from 'cookie-session';
import * as helmet from 'helmet';
import * as moment from 'moment';
import * as nunjucks from 'nunjucks';
import * as passport from 'passport';
import { AnnouncementService } from './announcement/announcement.service';
import { AppModule } from './app.module';
import { BanFilter } from './common/filter/ban.filter';
import { ViewFilter } from './common/filter/view.filter';
import { BanGuard } from './common/guard/ban.guard';
import { VIEW_DIR_PATH } from './common/utils/constants';
import { PartnerService } from './partner/partner.service';
import { SubscriptionLevel, SubscriptionLevelToFrench } from './subscription/subscription.interfaces';
import flash = require('connect-flash');

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const config = app.get(ConfigService);
    const isDev = config.get('ENV') === 'development';

    const announcementService = app.get(AnnouncementService);
    const partnerService = app.get(PartnerService);

    app.useGlobalFilters(new ViewFilter(isDev));
    app.useGlobalFilters(new BanFilter());

    app.useGlobalGuards(new BanGuard());

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
    app.use(flash());

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
        .addGlobal('SubscriptionLevelToFrench', SubscriptionLevelToFrench)
        .addGlobal('SubscriptionLevel', SubscriptionLevel)
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
        )
        .addFilter('date', function(date: Date | moment.Moment | string, format: string) {
            return moment(date)
                .locale('fr')
                .format(format);
        });
    app.setViewEngine('nunj');

    //Pass req to template engine
    app.use(async (req, res, next) => {
        res.locals.req = req;
        res.locals.announcement = await announcementService.current();
        res.locals.partners = await partnerService.all();
        next();
    });

    await app.listen(3000);
}

bootstrap();
