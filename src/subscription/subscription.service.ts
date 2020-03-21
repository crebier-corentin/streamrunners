import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityService } from '../common/utils/entity-service';
import { UserEntity } from '../user/user.entity';
import { PaypalService } from './paypal.service';
import { SubscriptionEntity } from './subscription.entity';

@Injectable()
export class SubscriptionService extends EntityService<SubscriptionEntity> {
    public constructor(@InjectRepository(SubscriptionEntity) repo, private readonly paypal: PaypalService) {
        super(repo);
    }

    public getCurrentSubscription(user: UserEntity): Promise<SubscriptionEntity | undefined> {
        return this.repo
            .createQueryBuilder('sub')
            .leftJoin('sub.user', 'user')
            .where('user.id = :userId', { userId: user.id })
            .getOne();
    }
}
