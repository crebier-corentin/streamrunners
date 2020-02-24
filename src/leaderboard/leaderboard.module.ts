import {Module} from '@nestjs/common';
import {LeaderboardController} from './leaderboard.controller';
import {UserModule} from "../user/user.module";

@Module({
    imports: [UserModule],
    controllers: [LeaderboardController]
})
export class LeaderboardModule {
}
