import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { DiscordBotService } from './discord-bot.service';
import { DiscordUserEntity } from './discord-user.entity';
import { DiscordUserService } from './discord-user.service';

@Module({
    imports: [TypeOrmModule.forFeature([DiscordUserEntity]), forwardRef(() => UserModule)],
    providers: [DiscordUserService, DiscordBotService],
    exports: [DiscordBotService],
})
export class DiscordModule {}
