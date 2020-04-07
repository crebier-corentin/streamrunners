import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { AffiliateController } from './affiliate.controller';

@Module({
    imports: [UserModule],
    controllers: [AffiliateController],
})
export class AffiliateModule {}
