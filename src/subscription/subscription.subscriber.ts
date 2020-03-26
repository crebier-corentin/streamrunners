import { Connection, EntitySubscriberInterface, EventSubscriber } from 'typeorm';
import { LoadEvent } from 'typeorm/subscriber/event/LoadEvent';
import { isAxiosError } from '../common/utils/utils';
import { PaypalService } from './paypal.service';
import { SubscriptionEntity } from './subscription.entity';

@EventSubscriber()
export class SubscriptionSubscriber implements EntitySubscriberInterface<SubscriptionEntity> {
    public constructor(connection: Connection, private readonly paypal: PaypalService) {
        connection.subscribers.push(this);
    }

    public listenTo(): Function {
        return SubscriptionEntity;
    }

    public async afterLoad(entity: SubscriptionEntity, { manager }: LoadEvent<SubscriptionEntity>): Promise<void> {
        console.log(entity.id);
        if (entity.paypalId == undefined) {
            entity.details = null;
            return;
        }

        try {
            entity.details = await this.paypal.getSubscriptionDetails(entity.paypalId);
            entity.isActive = SubscriptionSubscriber.isActive(entity);

            //Disable if not active
            if (entity.current && !entity.isActive && entity.details.status !== 'APPROVAL_PENDING') {
                entity.current = false;
                await manager
                    .getRepository(SubscriptionEntity)
                    .createQueryBuilder()
                    .update()
                    .where('id = :id', { id: entity.id })
                    .set({ current: false })
                    .callListeners(false)
                    .execute();
            }
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
                throw e;
            }
        }
    }

    private static isActive(entity: SubscriptionEntity): boolean {
        //Active
        if (entity.details?.status === 'ACTIVE' || entity.details?.status === 'APPROVED') return true;

        //Other status (Cancelled...)
        return !entity.isExpired();
    }
}
