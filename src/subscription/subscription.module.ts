import { forwardRef, Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { PaypalService } from './paypal.service';
import { SubscriptionService } from './subscription.service';

@Module({
    imports: [forwardRef(() => UserModule)],
    providers: [PaypalService, SubscriptionService],
})
export class SubscriptionModule {}
