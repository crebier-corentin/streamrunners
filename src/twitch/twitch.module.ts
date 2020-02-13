import { TwitchService } from './twitch.service';
import { Module } from '@nestjs/common';

@Module({
    providers: [TwitchService],
    exports: [TwitchService],
})
export class TwitchModule {}
