import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityService } from '../common/utils/entity-service';
import { UserEntity } from '../user/user.entity';
import { PaypalSubscriptionDetails } from './paypal.interfaces';
import { PaypalService } from './paypal.service';
import { SubscriptionEntity, SubscriptionEntityAndDetails } from './subscription.entity';

@Injectable()
export class SubscriptionService extends EntityService<SubscriptionEntity> {
    public constructor(@InjectRepository(SubscriptionEntity) repo, private readonly paypal: PaypalService) {
        super(repo);
    }

    public getSubscriptionDetails(subOrId: SubscriptionEntity | string): Promise<PaypalSubscriptionDetails> {
        const id: string = subOrId instanceof SubscriptionEntity ? subOrId.paypalId : subOrId;

        return this.paypal.getSubscriptionDetails(id);
    }

    public getCurrentSubscription(user: UserEntity): Promise<SubscriptionEntity | undefined> {
        return this.repo
            .createQueryBuilder('sub')
            .leftJoin('sub.user', 'user')
            .where('user.id = :userId', { userId: user.id })
            .getOne();
    }

    /**
     * If the subscription is expired, set it's current value to false and returns null
     * @param user
     */
    public async getCurrentSubscriptionAndDetails(user: UserEntity): Promise<SubscriptionEntityAndDetails | null> {
        const sub = await this.getCurrentSubscription(user);
        if (sub == undefined) return null;

        //Load details
        const subD = new SubscriptionEntityAndDetails();
        subD.entity = sub;
        subD.details = await this.getSubscriptionDetails(sub);

        //Remove it from current if expired
        if (subD.isExpired()) {
            sub.current = false;
            await this.repo.save(sub);
            return null;
        }

        return subD;
    }
}
