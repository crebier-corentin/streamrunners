import { Connection, EntitySubscriberInterface, EventSubscriber } from 'typeorm';
import { SubscriptionLevel } from '../subscription/subscription.interfaces';
import { UserEntity } from './user.entity';

/**
 * Typeorm subscriber for [[UserEntity]] that loads [[UserEntity.currentSubscription]].\
 * Requires [[UserEntity.birthday]], [[UserEntity.partner]], [[UserEntity.moderator]], [[UserEntity.admin]] and [[UserEntity.currentSubscription]] to obtain the correct subscription level.
 *
 * @category Subscriber
 *
 */
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
