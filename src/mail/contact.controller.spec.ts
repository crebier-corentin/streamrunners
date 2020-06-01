import { Test, TestingModule } from '@nestjs/testing';
import { UserErrorException } from '../common/exception/user-error.exception';
import { RecaptchaService } from '../recaptcha/recaptcha.service';
import { ContactController } from './contact.controller';
import { MailService } from './mail.service';

describe('Contact Controller', () => {
    let controller: ContactController;
    let mailService: MailService;
    let recaptchaService: RecaptchaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ContactController],
            providers: [
                {
                    provide: MailService,
                    useValue: {
                        emailAddress: 'test@example.com',
                        sendMail: jest.fn(),
                    },
                },
                {
                    provide: RecaptchaService,
                    useValue: {
                        validate: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<ContactController>(ContactController);
        mailService = module.get<MailService>(MailService);
        recaptchaService = module.get<RecaptchaService>(RecaptchaService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('contact', () => {
        it('should throw if the recaptcha validation fails', () => {
            jest.spyOn(recaptchaService, 'validate').mockResolvedValue(false);

            return expect(
                controller.contact(
                    {
                        email: 'user@example.com',
                        subject: 'Test',
                        message: 'Testing',
                        'g-recaptcha-response': '',
                    },
                    { flash: jest.fn() } as any
                )
            ).rejects.toBeInstanceOf(UserErrorException);
        });

        it('should send a mail to the contact address and send a confirmation mail to the user', async () => {
            jest.spyOn(recaptchaService, 'validate').mockResolvedValue(true);
            const mockedSendMail = jest.spyOn(mailService, 'sendMail').mockImplementation();

            await controller.contact(
                {
                    email: 'user@example.com',
                    subject: 'Test',
                    message: 'Testing',
                    'g-recaptcha-response': '',
                },
                { flash: jest.fn() } as any
            );

            expect(mockedSendMail).toHaveBeenNthCalledWith(1, {
                to: 'test@example.com',
                replyTo: 'user@example.com',
                subject: 'Test',
                text: expect.stringContaining('Testing'),
            });

            expect(mockedSendMail).toHaveBeenNthCalledWith(2, {
                to: 'user@example.com',
                subject: expect.any(String),
                text: expect.any(String),
            });
        });
    });
});
