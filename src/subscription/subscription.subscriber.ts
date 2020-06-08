import { Connection, EntitySubscriberInterface, EventSubscriber } from 'typeorm';
import { LoadEvent } from 'typeorm/subscriber/event/LoadEvent';
import { isAxiosError } from '../common/utils/utils';
import { PaypalService } from './paypal.service';
import { SubscriptionEntity } from './subscription.entity';
import moment = require('moment');

/**
 * Typeorm subscriber for [[SubscriptionEntity]].\
 * Updates [[SubscriptionEntity.details]] every hour.\
 * Sets [[SubscriptionEntity.isActive]].
 *
 * Deletes the subscription if it does not exist on paypal (404 error while trying to get details).
 * Removes the [[SubscriptionEntity.currentUser]] relation if the subscription is not active and expired.
 *
 * @category Subscriber
 */
@EventSubscriber()
export class SubscriptionSubscriber implements EntitySubscriberInterface<SubscriptionEntity> {
    public constructor(connection: Connection, private readonly paypal: PaypalService) {
        connection.subscribers.push(this);
    }

    public listenTo(): Function {
        return SubscriptionEntity;
    }

    public async afterLoad(entity: SubscriptionEntity, { manager }: LoadEvent<SubscriptionEntity>): Promise<void> {
        if (entity.paypalId == undefined) return;

        //Update details every hour
        if (moment(entity.lastDetailsUpdate).add(1, 'hour') < moment()) {
            try {
                entity.details = await this.paypal.getSubscriptionDetails(entity.paypalId);
                entity.lastDetailsUpdate = new Date();

                await manager
                    .getRepository(SubscriptionEntity)
                    .createQueryBuilder()
                    .update()
                    .set({ details: entity.details, lastDetailsUpdate: entity.lastDetailsUpdate })
                    .where('id = :id', { id: entity.id })
                    .callListeners(false)
                    .execute();
            } catch (e) {
                //Paypal 404 error
                if (isAxiosError(e) && e?.response?.status === 404) {
                    entity.details = null;
                    entity.isActive = false;

                    await manager
                        .getRepository(SubscriptionEntity)
                        .createQueryBuilder()
                        .delete()
                        .where('id = :id', { id: entity.id })
                        .callListeners(false)
                        .execute();
                } else {
                    console.error(e);
                }

                return;
            }
        }

        entity.isActive = SubscriptionSubscriber.isActive(entity);

        //Disable if not active
        if (!entity.isActive && entity.details.status !== 'APPROVAL_PENDING') {
            await manager
                .getRepository(SubscriptionEntity)
                .createQueryBuilder()
                .relation('currentUser')
                .callListeners(false)
                .of(entity)
                .set(null);
        }
    }

    private static isActive(entity: SubscriptionEntity): boolean {
        //Active
        if (entity.details?.status === 'ACTIVE' || entity.details?.status === 'APPROVED') return true;

        //Other status (Cancelled...)
        return !entity.isExpired();
    }
}
