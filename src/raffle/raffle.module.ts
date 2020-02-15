import { UserModule } from '../user/user.module';
import { RaffleParticipationEntity } from './raffle-participation.entity';
import { RaffleController } from './raffle.controller';
import { RaffleEntity } from './raffle.entity';
import { RaffleService } from './raffle.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([RaffleEntity, RaffleParticipationEntity]), UserModule],
    controllers: [RaffleController],
    providers: [RaffleService],
    exports: [RaffleService],
})
export class RaffleModule {}
