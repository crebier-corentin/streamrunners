import {
    Body,
    Controller,
    Get,
    Post,
    Redirect,
    Render,
    Req,
    UseFilters,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { ValidationErrorsException } from '../common/exception/validation-errors.exception';
import { FlashAndRedirectUserErrorFilter } from '../common/filter/flash-and-redirect-user-error.filter';
import { SanitizationPipe } from '../common/pipe/sanitization-pipe.service';
import { ContactDto } from './contact.dto';
import { MailService } from './mail.service';

@Controller('contact')
export class ContactController {
    public constructor(private readonly mailService: MailService) {}

    @Render('contact')
    @Get()
    public index(@Req() req): { success: any; error: any } {
        return {
            success: req.flash('success'),
            error: req.flash('error'),
        };
    }

    @UsePipes(
        SanitizationPipe,
        new ValidationPipe({
            exceptionFactory: (errors): ValidationErrorsException => new ValidationErrorsException(errors),
        })
    )
    @UseFilters(new FlashAndRedirectUserErrorFilter('/contact'))
    @Redirect('/contact')
    @Post()
    public async contact(@Body() body: ContactDto, @Req() req): Promise<void> {
        //Send contact mail to self
        await this.mailService.sendMail({
            to: this.mailService.emailAddress,
            replyTo: body.email,
            subject: body.subject,
            text: body.message,
        });

        //Send confirmation email
        await this.mailService.sendMail({
            to: body.email,
            subject: 'StreamRunners | Nous avons bien reçu votre message !',
            text: 'Merci de nous avoir contacté.',
        });

        req.flash('success', 'Message envoyé avec succès !\nVous devriez reçevoir un email bientôt.');
    }
}
