import { Test, TestingModule } from '@nestjs/testing';
import { ContactController } from './contact.controller';
import { MailService } from './mail.service';

describe('Contact Controller', () => {
    let controller: ContactController;
    let mailService: MailService;

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
            ],
        }).compile();

        controller = module.get<ContactController>(ContactController);
        mailService = module.get<MailService>(MailService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('contact', () => {
        it('should send a mail to the contact address and send a confirmation mail to the user', async () => {
            const mockedSendMail = jest.spyOn(mailService, 'sendMail').mockImplementation();

            await controller.contact(
                {
                    email: 'user@example.com',
                    subject: 'Test',
                    message: 'Testing',
                },
                { flash: jest.fn() } as any
            );

            expect(mockedSendMail).toHaveBeenNthCalledWith(1, {
                to: 'test@example.com',
                replyTo: 'user@example.com',
                subject: 'Test',
                text: 'Testing',
            });

            expect(mockedSendMail).toHaveBeenNthCalledWith(2, {
                to: 'user@example.com',
                subject: expect.any(String),
                text: expect.any(String),
            });
        });
    });
});
