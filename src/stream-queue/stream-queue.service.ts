import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EntityService } from '../common/utils/entity-service';
import { TwitchService } from '../twitch/twitch.service';
import { UserEntity } from '../user/user.entity';
import { StreamQueueEntity } from './stream-queue.entity';
import moment = require('moment');

@Injectable()
export class StreamQueueService extends EntityService<StreamQueueEntity> {
    public constructor(
        @InjectRepository(StreamQueueEntity) repo: Repository<StreamQueueEntity>,
        private readonly twitch: TwitchService
    ) {
        super(repo);
    }

    /**
     *
     * @remark
     * Will load the [[StreamQueueEntity.user]] relation.
     *
     * @param streamId Searched [[StreamQueueEntity.id]].
     * @param userId The [[UserEntity.id]] of the stream's owner ([[StreamQueueEntity.user]]).
     *
     * @returns The matched [[StreamQueueEntity]] or undefined if no match was found.
     */
    public byIdAndUserId(streamId: number, userId: number): Promise<StreamQueueEntity | undefined> {
        return this.repo
            .createQueryBuilder('queue')
            .leftJoinAndSelect('queue.user', 'user')
            .where('queue.id = :streamId', { streamId })
            .andWhere('user.id = :userId', { userId })
            .getOne();
    }

    /**
     *
     * @remark
     * Will load the [[StreamQueueEntity.user]] relation.
     *
     * @param streamId Searched [[StreamQueueEntity.id]].
     * @param userId The [[UserEntity.id]] of the stream's owner ([[StreamQueueEntity.user]]).
     * @param exception The exception to throw when no matching entities have been found.
     *
     * @returns The matched [[StreamQueueEntity]].
     */
    public async byIdAndUserIdOrFail(
        streamId: number,
        userId: number,
        exception: HttpException = new InternalServerErrorException()
    ): Promise<StreamQueueEntity> {
        const entity = await this.byIdAndUserId(streamId, userId);
        if (entity == undefined) throw exception;

        return entity;
    }

    /**
     * @returns The current shown stream or undefined if the queue is empty.
     */
    public currentStream(): Promise<StreamQueueEntity | undefined> {
        return this.repo
            .createQueryBuilder('queue')
            .leftJoinAndSelect('queue.user', 'user')
            .where('queue.current < queue.time')
            .orderBy('queue.createdAt', 'ASC')
            .getOne();
    }

    /**
     * @returns The current shown stream and the queue.
     */
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

    /**
     * @returns if no current stream is shown and the queue is empty.
     */
    public async isEmpty(): Promise<boolean> {
        return (await this.currentStream()) == undefined;
    }

    /**
     *
     * Insert a new [[StreamQueueEntity]].
     *
     * @param cost [[StreamQueueEntity.amount]].
     * @param time [[StreamQueueEntity.time]].
     * @param user [[StreamQueueEntity.user]].
     */
    public async insert(cost: number, time: number, user: UserEntity): Promise<void> {
        const stream = new StreamQueueEntity();
        stream.amount = cost;
        stream.time = time;
        stream.user = user;
        await this.repo.save(stream);
    }

    /**
     * Skip the current shown stream.
     */
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

    /**
     * Updates the stream queue.\
     * Updates [[StreamQueueEntity.current]] of the current shown stream and start a new stream once the old one is over.
     */
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
