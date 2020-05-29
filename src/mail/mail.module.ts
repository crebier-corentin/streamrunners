import { Module } from '@nestjs/common';
import { ContactController } from './contact.controller';
import { MailService } from './mail.service';

@Module({
    providers: [MailService],
    exports: [MailService],
    controllers: [ContactController],
})
export class MailModule {}
