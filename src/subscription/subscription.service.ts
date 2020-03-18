import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityService } from '../common/utils/entity-service';
import { UserEntity } from '../user/user.entity';
import { PaypalService } from './paypal.service';
import { SubscriptionEntity } from './subscription.entity';
import { SubscriptionStatus } from './subscription.interfaces';

@Injectable()
export class SubscriptionService extends EntityService<SubscriptionEntity> {
    public constructor(@InjectRepository(SubscriptionEntity) repo, private readonly paypal: PaypalService) {
        super(repo);
    }

    /**
     * Tries to find an Active subscription, if there is none tries to find an CancelledActive one.
     * If it's expired, updates it's status to Cancelled.
     * @param user
     */
    public async getActiveSubscription(user: UserEntity): Promise<SubscriptionEntity | null> {
        //Active
        const active = await this.repo
            .createQueryBuilder('sub')
            .leftJoin('sub.user', 'user')
            .where('user.id = :userId', { userId: user.id })
            .andWhere('sub.status = :status', { status: SubscriptionStatus.Active })
            .getOne();

        if (active != undefined) return active;

        //CancelledActive
        const cancelledActive = await this.repo
            .createQueryBuilder('sub')
            .leftJoin('sub.user', 'user')
            .where('user.id = :userId', { userId: user.id })
            .andWhere('sub.status = :status', { status: SubscriptionStatus.CancelledActive })
            .getOne();

        if (cancelledActive != undefined) {
            if (!cancelledActive.expired()) return cancelledActive;

            //Update status if expired
            cancelledActive.status = SubscriptionStatus.Cancelled;
            await this.repo.save(cancelledActive);
        }

        return null;
    }
}
