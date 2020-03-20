import { Connection, EntitySubscriberInterface, EventSubscriber } from 'typeorm';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<UserEntity> {
    public constructor(connection: Connection, private readonly userService: UserService) {
        connection.subscribers.push(this);
    }

    public listenTo(): Function {
        return UserEntity;
    }

    public async afterLoad(entity: UserEntity): Promise<void> {
        entity.subscriptionLevel = await this.userService.getSubscriptionLevel(entity);
    }
}
