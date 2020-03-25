import { Connection, EntitySubscriberInterface, EventSubscriber } from 'typeorm';
import { SubscriptionEntity } from '../subscription/subscription.entity';
import { SubscriptionLevel } from '../subscription/subscription.interfaces';
import { SubscriptionService } from '../subscription/subscription.service';
import { UserEntity } from './user.entity';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<UserEntity> {
    public constructor(connection: Connection, private readonly subscriptionService: SubscriptionService) {
        connection.subscribers.push(this);
    }

    public listenTo(): Function {
        return UserEntity;
    }

    public async afterLoad(entity: UserEntity): Promise<void> {
        entity.currentSubscription = await this.getCurrentSubscription(entity);
        entity.subscriptionLevel = await UserSubscriber.getSubscriptionLevel(entity);
    }

    private getCurrentSubscription(user: UserEntity): Promise<SubscriptionEntity | undefined> {
        return this.subscriptionService.getCurrentSubscription(user);
    }

    private static getSubscriptionLevel(user: UserEntity): SubscriptionLevel {
        //Diamond for partners
        if (user.partner) return SubscriptionLevel.Diamond;

        return user.currentSubscription?.isActive() ? user.currentSubscription.level : SubscriptionLevel.None;
    }
}
