import { Connection, EntitySubscriberInterface, EventSubscriber } from 'typeorm';
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

    public async afterLoad(entity: SubscriptionEntity): Promise<void> {
        if (entity.paypalId == undefined) {
            entity.details = null;
        } else {
            try {
                entity.details = await this.paypal.getSubscriptionDetails(entity.paypalId);
            } catch (e) {
                //Paypal 404 error
                if (isAxiosError(e) && e?.response?.status === 404) {
                    entity.details = null;
                } else {
                    throw e;
                }
            }
        }
    }
}
