import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RecaptchaService } from './recaptcha.service';

@Module({
    providers: [
        {
            provide: RecaptchaService,
            inject: [ConfigService],
            useFactory: (config: ConfigService): RecaptchaService =>
                new RecaptchaService(config.get('RECAPTCHA_SECRET')),
        },
    ],
    exports: [RecaptchaService],
})
export class RecaptchaModule {}
