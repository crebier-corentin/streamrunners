import { Module } from '@nestjs/common';
import { RecaptchaModule } from '../recaptcha/recaptcha.module';
import { ContactController } from './contact.controller';
import { MailService } from './mail.service';

@Module({
    imports: [RecaptchaModule],
    providers: [MailService],
    exports: [MailService],
    controllers: [ContactController],
})
export class MailModule {}
