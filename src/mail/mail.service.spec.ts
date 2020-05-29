import nodemailerMock = require('nodemailer');
import Mock = jest.Mock;

jest.mock('nodemailer');
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';

describe('MailService', () => {
    let service: MailService;
    let mockedCreateTransport: Mock;
    let mockedVerify: Mock;
    let mockedSendMail: Mock;

    beforeEach(async () => {
        mockedVerify = jest.fn();
        mockedSendMail = jest.fn();
        mockedCreateTransport = jest.fn().mockReturnValue({ verify: mockedVerify, sendMail: mockedSendMail });
        jest.spyOn(nodemailerMock, 'createTransport').mockImplementation(mockedCreateTransport);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MailService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key: string) => {
                            switch (key) {
                                case 'MAIL_SMTP_HOST':
                                    return 'example.com';
                                case 'MAIL_SMTP_PORT':
                                    return '465';
                                case 'MAIL_SMTP_SECURE':
                                    return 'true';
                                case 'MAIL_SMTP_USER':
                                    return 'user';
                                case 'MAIL_SMTP_PASSWORD':
                                    return 'password';
                                case 'MAIL_SMTP_ADDRESS':
                                    return 'user@example.com';
                            }
                        }),
                    },
                },
            ],
        }).compile();

        service = module.get<MailService>(MailService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('constructor', () => {
        it.each([
            ['false', false],
            ['true', true],
        ])('should create a transporter with the specified config', (secureStr: string, expectedSecure: boolean) => {
            const mockedConfig = {
                get: jest.fn((key: string) => {
                    switch (key) {
                        case 'MAIL_SMTP_HOST':
                            return 'example.com';
                        case 'MAIL_SMTP_PORT':
                            return '465';
                        case 'MAIL_SMTP_SECURE':
                            return secureStr;
                        case 'MAIL_SMTP_USER':
                            return 'user';
                        case 'MAIL_SMTP_PASSWORD':
                            return 'password';
                        case 'MAIL_SMTP_ADDRESS':
                            return 'user@example.com';
                    }
                }),
            };

            const service = new MailService(mockedConfig as any);

            expect(mockedCreateTransport).toHaveBeenCalledWith({
                host: 'example.com',
                port: 465,
                secure: expectedSecure,
                auth: {
                    user: 'user',
                    pass: 'password',
                },
            });
            expect(service.emailAddress).toBe('user@example.com');
        });
    });

    describe('onApplicationBootstrap', () => {
        it('should throw if verify fails', () => {
            mockedVerify.mockRejectedValue(new Error('oops'));

            return expect(service.onApplicationBootstrap()).rejects.toBeDefined();
        });
    });

    describe('sendMail', () => {
        it('should sent a mail from the specified address', async () => {
            await service.sendMail({
                to: 'someone@example.com',
                subject: 'Hi',
                text: 'This is a test',
                html: 'This is a <b>test</b>',
            });

            expect(mockedSendMail).toHaveBeenCalledWith({
                from: 'user@example.com',
                to: 'someone@example.com',
                subject: 'Hi',
                text: 'This is a test',
                html: 'This is a <b>test</b>',
            });
        });
    });
});
