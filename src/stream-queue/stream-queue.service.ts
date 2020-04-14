import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EntityService } from '../common/utils/entity-service';
import { DiscordBotService } from '../discord/discord-bot.service';
import { TwitchService } from '../twitch/twitch.service';
import { UserEntity } from '../user/user.entity';
import { StreamQueueEntity } from './stream-queue.entity';
import moment = require('moment');

@Injectable()
export class StreamQueueService extends EntityService<StreamQueueEntity> {
    public constructor(
        @InjectRepository(StreamQueueEntity) repo: Repository<StreamQueueEntity>,
        private readonly discordBot: DiscordBotService,
        private readonly twitch: TwitchService
    ) {
        super(repo);
    }

    public byIdAndUserId(streamId: number, userId: number): Promise<StreamQueueEntity | undefined> {
        return this.repo
            .createQueryBuilder('queue')
            .leftJoinAndSelect('queue.user', 'user')
            .where('queue.id = :streamId', { streamId })
            .andWhere('user.id = :userId', { userId })
            .getOne();
    }

    public async byIdAndUserIdOrFail(
        streamId: number,
        userId: number,
        exception: HttpException = new InternalServerErrorException()
    ): Promise<StreamQueueEntity> {
        const entity = await this.byIdAndUserId(streamId, userId);
        if (entity == undefined) throw exception;

        return entity;
    }

    public currentStream(): Promise<StreamQueueEntity | undefined> {
        return this.repo
            .createQueryBuilder('queue')
            .leftJoinAndSelect('queue.user', 'user')
            .where('queue.current < queue.time')
            .orderBy('queue.createdAt', 'ASC')
            .getOne();
    }

    public currentAndNextStreams(): Promise<StreamQueueEntity[]> {
        return this.repo
            .createQueryBuilder('queue')
            .select(['queue.time', 'queue.current', 'queue.id'])
            .leftJoin('queue.user', 'user')
            .addSelect(['user.username', 'user.avatar', 'user.displayName'])
            .where('queue.current < queue.time')
            .orderBy('queue.createdAt', 'ASC')
            .getMany();
    }

    public async isEmpty(): Promise<boolean> {
        return (await this.currentStream()) == undefined;
    }

    public async insert(cost: number, time: number, user: UserEntity): Promise<void> {
        const stream = new StreamQueueEntity();
        stream.amount = cost;
        stream.time = time;
        stream.user = user;
        await this.repo.save(stream);

        await this.discordBot.sendStreamNotificationMessage();
    }

    public async skipCurrent(): Promise<void> {
        const stream = await this.currentStream();
        if (stream == undefined) return;

        stream.current = stream.time;
        await this.repo.save(stream);
    }

    /**
     * @return The number of places the user has in the queue.
     */
    public async placesCount(user: UserEntity);
    public async placesCount(userId: number);
    public async placesCount(userOrUserId: UserEntity | number): Promise<number> {
        const userId = userOrUserId instanceof UserEntity ? userOrUserId.id : userOrUserId;

        return this.repo
            .createQueryBuilder('queue')
            .leftJoinAndSelect('queue.user', 'user')
            .where('user.id = :userId', { userId })
            .andWhere('queue.current < queue.time')
            .orderBy('queue.createdAt', 'ASC')
            .getCount();
    }

    @Cron(CronExpression.EVERY_SECOND)
    private async updateQueue(): Promise<void> {
        const currentStream = await this.currentStream();

        //If queue is empty do nothing
        if (currentStream == undefined) return;

        //Skip if stream is offline
        if (!(await this.twitch.isStreamOnline(currentStream.user.twitchId))) {
            currentStream.current = currentStream.time;
            await this.repo.save(currentStream);

            return;
        }

        //Start if null
        if (currentStream.start == null) {
            currentStream.start = new Date();
        }
        //Update current
        else {
            const seconds = moment().diff(currentStream.start, 'seconds');
            currentStream.current = Math.min(seconds, currentStream.time); //current can be bigger than time if the stream ends during a maintenance
        }

        await this.repo.save(currentStream);
    }
}
