import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaypalService } from './paypal.service';
import { SubscriptionLevelInfoEntity } from './subscription-level-info.entity';
import { SubscriptionLevelInfoService } from './subscription-level-info.service';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionEntity } from './subscription.entity';
import { SubscriptionService } from './subscription.service';
import { SubscriptionSubscriber } from './subscription.subscriber';

@Module({
    imports: [TypeOrmModule.forFeature([SubscriptionEntity, SubscriptionLevelInfoEntity])],
    providers: [PaypalService, SubscriptionService, SubscriptionSubscriber, SubscriptionLevelInfoService],
    exports: [SubscriptionService, SubscriptionLevelInfoService],
    controllers: [SubscriptionController],
})
export class SubscriptionModule {}
