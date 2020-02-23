import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscordModule } from '../discord/discord.module';
import { UserModule } from '../user/user.module';
import { RaffleParticipationEntity } from './raffle-participation.entity';
import { RaffleController } from './raffle.controller';
import { RaffleEntity } from './raffle.entity';
import { RaffleService } from './raffle.service';

@Module({
    imports: [TypeOrmModule.forFeature([RaffleEntity, RaffleParticipationEntity]), UserModule, DiscordModule],
    controllers: [RaffleController],
    providers: [RaffleService],
    exports: [RaffleService],
})
export class RaffleModule {}
