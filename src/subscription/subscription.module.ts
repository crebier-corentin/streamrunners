import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaypalService } from './paypal.service';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionEntity } from './subscription.entity';
import { SubscriptionService } from './subscription.service';
import { SubscriptionSubscriber } from './subscription.subscriber';

@Module({
    imports: [TypeOrmModule.forFeature([SubscriptionEntity])],
    providers: [PaypalService, SubscriptionService, SubscriptionSubscriber],
    exports: [SubscriptionService],
    controllers: [SubscriptionController],
})
export class SubscriptionModule {}
