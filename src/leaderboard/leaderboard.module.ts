import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { LeaderboardController } from './leaderboard.controller';

@Module({
    imports: [UserModule],
    controllers: [LeaderboardController],
})
export class LeaderboardModule {}
