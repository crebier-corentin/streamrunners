import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import * as Mail from 'nodemailer/lib/mailer';

@Injectable()
export class MailService implements OnApplicationBootstrap {
    private readonly transporter: Transporter;
    public readonly emailAddress: string;

    public constructor(config: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: config.get<string>('MAIL_SMTP_HOST'),
            port: Number(config.get<string>('MAIL_SMTP_PORT')),
            secure: config.get<string>('MAIL_SMTP_SECURE').toLowerCase() === 'true',
            auth: {
                user: config.get<string>('MAIL_SMTP_USER'),
                pass: config.get<string>('MAIL_SMTP_PASSWORD'),
            },
            tls: {
                rejectUnauthorized: false,
            },
        });

        this.emailAddress = config.get<string>('MAIL_SMTP_ADDRESS');
    }

    public async onApplicationBootstrap(): Promise<void> {
        try {
            await this.transporter.verify(); //Will throw if SMTP config is invalid
        } catch (e) {
            throw new Error(`Invalid SMTP configuration :\n ${e}`);
        }
    }

    public async sendMail(options: Omit<Mail.Options, 'from'>): Promise<void> {
        await this.transporter.sendMail({ ...options, from: this.emailAddress });
    }
}
