import { Connection, EntitySubscriberInterface, EventSubscriber } from 'typeorm';
import { SubscriptionLevel } from '../subscription/subscription.interfaces';
import { UserEntity } from './user.entity';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<UserEntity> {
    public constructor(connection: Connection) {
        connection.subscribers.push(this);
    }

    public listenTo(): Function {
        return UserEntity;
    }

    public async afterLoad(entity: UserEntity): Promise<void> {
        entity.subscriptionLevel = await UserSubscriber.getSubscriptionLevel(entity);
    }

    private static getSubscriptionLevel(user: UserEntity): SubscriptionLevel {
        //Diamond for partners, moderators and admins
        if (user.birthday || user.partner || user.moderator || user.admin) return SubscriptionLevel.Diamond;

        return user.currentSubscription?.isActive ? user.currentSubscription.level : SubscriptionLevel.None;
    }
}
