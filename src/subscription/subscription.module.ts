import { forwardRef, Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { PaypalService } from './paypal.service';

@Module({
    imports: [forwardRef(() => UserModule)],
    providers: [PaypalService],
})
export class SubscriptionModule {}
