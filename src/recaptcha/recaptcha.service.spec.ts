import { Test, TestingModule } from '@nestjs/testing';
import { RecaptchaService } from './recaptcha.service';
import nock = require('nock');

describe('RecaptchaService', () => {
    let service: RecaptchaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: RecaptchaService,
                    useFactory: (): RecaptchaService => new RecaptchaService('secret'),
                },
            ],
        }).compile();

        service = module.get<RecaptchaService>(RecaptchaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('validate', () => {
        it.each([true, false])(
            "should send a request to recaptcha's API and return success (%s)",
            (success: boolean) => {
                nock('https://www.google.com')
                    .post('/recaptcha/api/siteverify', { secret: 'secret', response: 'test' })
                    .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
                    .reply(200, {
                        success,
                    });

                return expect(service.validate('test')).resolves.toBe(success);
            }
        );
    });

    it('should return false if the request fails', () => {
        nock('https://www.google.com')
            .post('/recaptcha/api/siteverify', { secret: 'secret', response: 'test' })
            .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
            .reply(500);

        //Mock console.error to avoid printing during the test
        const originalConsoleError = console.error;
        console.error = jest.fn();

        const tmp = expect(service.validate('test')).resolves.toBe(false);

        console.error = originalConsoleError;

        return tmp;
    });
});
