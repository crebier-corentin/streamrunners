/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { PaypalService } from './paypal.service';
import { SubscriptionEntity } from './subscription.entity';
import { SubscriptionLevel } from './subscription.interfaces';
import { SubscriptionService } from './subscription.service';
import MockDate = require('mockdate');
import { PaypalSubscriptionDetails } from './paypal.interfaces';

describe('SubscriptionService', () => {
    let service: SubscriptionService;
    let repo: Repository<SubscriptionEntity>;
    let paypal: PaypalService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SubscriptionService,
                {
                    provide: getRepositoryToken(SubscriptionEntity),
                    useClass: Repository,
                },
                {
                    provide: PaypalService,
                    useValue: {
                        getSubscriptionDetails: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<SubscriptionService>(SubscriptionService);
        repo = module.get<Repository<SubscriptionEntity>>(getRepositoryToken(SubscriptionEntity));
        paypal = module.get<PaypalService>(PaypalService);

        // @ts-ignore
        jest.spyOn(repo, 'save').mockImplementation(entity => entity);

        MockDate.reset();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
