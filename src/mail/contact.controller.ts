import {
    Body,
    Controller,
    Get,
    Post,
    Redirect,
    Render,
    Req,
    Res,
    UseFilters,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { UserErrorException } from '../common/exception/user-error.exception';
import { ValidationErrorsException } from '../common/exception/validation-errors.exception';
import { FlashAndRedirectUserErrorFilter } from '../common/filter/flash-and-redirect-user-error.filter';
import { SanitizationPipe } from '../common/pipe/sanitization-pipe.service';
import { RecaptchaService } from '../recaptcha/recaptcha.service';
import { ContactDto } from './contact.dto';
import { MailService } from './mail.service';

@Controller('contact')
export class ContactController {
    public constructor(private readonly mailService: MailService, private readonly recaptcha: RecaptchaService) {}

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
    public async contact(@Body() body: ContactDto, @Req() req: Request, @Res() res: Response): Promise<void> {
        if (!(await this.recaptcha.validate(body['g-recaptcha-response']))) {
            throw new UserErrorException('Erreur recaptcha.');
        }

        function promiseRender(view: string, data: Record<string, any>): Promise<string> {
            return new Promise((resolve, reject) => {
                res.render(view, data, (err, html) => {
                    if (err) reject(err);
                    else resolve(html);
                });
            });
        }

        //Send contact mail to self
        await this.mailService.sendMail({
            to: this.mailService.emailAddress,
            replyTo: body.email,
            subject: body.subject,
            text: `De : ${body.email}\n-----\n${body.message}`,
            html: await promiseRender('mail/contact', { email: body.email, message: body.message }),
        });

        //Send confirmation email
        await this.mailService.sendMail({
            to: body.email,
            subject: 'StreamRunners | Nous avons bien reçu votre message !',
            text: 'Merci de nous avoir contacté.',
            html: await promiseRender('mail/contact-confirm', { email: body.email, message: body.message }),
        });

        req.flash('success', 'Message envoyé avec succès !\nVous devriez reçevoir un email bientôt.');
    }
}
