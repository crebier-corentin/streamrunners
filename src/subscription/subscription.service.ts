import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityService } from '../common/utils/entity-service';
import { UserEntity } from '../user/user.entity';
import { PaypalSubscriptionDetails } from './paypal.interfaces';
import { PaypalService } from './paypal.service';
import { SubscriptionEntity } from './subscription.entity';
import { SubscriptionStatus } from './subscription.interfaces';

@Injectable()
export class SubscriptionService extends EntityService<SubscriptionEntity> {
    public constructor(@InjectRepository(SubscriptionEntity) repo, private readonly paypal: PaypalService) {
        super(repo);
    }

    public byUserIdAndStatus(userId: number, status: SubscriptionStatus): Promise<SubscriptionEntity | undefined> {
        return this.repo
            .createQueryBuilder('sub')
            .leftJoin('sub.user', 'user')
            .where('user.id = :userId', { userId })
            .andWhere('sub.status = :status', { status })
            .getOne();
    }

    /**
     * Tries to find an Active subscription, if there is one returns it.
     * Tries to find a CancelledActive subscription, if there is one and it's not expired returns it. If it's expired, updates it's status to Cancelled.
     * Tries to find a Queued subscription, if there is one activates it and returns it.
     * @param user
     */
    public async getActiveSubscription(user: UserEntity): Promise<SubscriptionEntity | null> {
        //Active
        const active = await this.byUserIdAndStatus(user.id, SubscriptionStatus.Active);

        if (active != undefined) return active;

        //CancelledActive
        const cancelledActive = await this.byUserIdAndStatus(user.id, SubscriptionStatus.CancelledActive);

        if (cancelledActive != undefined) {
            if (!cancelledActive.expired()) return cancelledActive;

            //Update status if expired
            cancelledActive.status = SubscriptionStatus.Cancelled;
            await this.repo.save(cancelledActive);
        }

        //Queued
        const queued = await this.byUserIdAndStatus(user.id, SubscriptionStatus.Queued);

        if (queued != undefined) {
            //Activate the queued sub
            await this.paypal.activateSubscription(queued.paypalId);
            queued.status = SubscriptionStatus.Active;
            await this.repo.save(queued);
        }

        return null;
    }

    public getQueuedSubscription(user: UserEntity): Promise<SubscriptionEntity | undefined> {
        return this.byUserIdAndStatus(user.id, SubscriptionStatus.Queued);
    }

    public async getSubscriptionDetails(subOrId: SubscriptionEntity | string): Promise<PaypalSubscriptionDetails> {
        const id: string = subOrId instanceof SubscriptionEntity ? subOrId.paypalId : subOrId;

        return this.paypal.getSubscriptionDetails(id);
    }
}
