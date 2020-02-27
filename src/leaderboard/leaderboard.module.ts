import { forwardRef, Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { LeaderboardDrawerService } from './leaderboard-drawer.service';
import { LeaderboardController } from './leaderboard.controller';

@Module({
    imports: [forwardRef(() => UserModule)],
    controllers: [LeaderboardController],
    providers: [LeaderboardDrawerService],
    exports: [LeaderboardDrawerService],
})
export class LeaderboardModule {}
