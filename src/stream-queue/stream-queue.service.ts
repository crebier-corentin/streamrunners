import { ModelService } from '../utils/ModelService';
import { UserEntity } from '../user/user.entity';
import { StreamQueueEntity } from './stream-queue.entity';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class StreamQueueService extends ModelService<StreamQueueEntity> {
    constructor(@InjectRepository(StreamQueueEntity) repo: Repository<StreamQueueEntity>) {
        super(repo);
    }

    byIdAndUserId(streamId: number, userId: number): Promise<StreamQueueEntity | undefined> {
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

    currentStream(): Promise<StreamQueueEntity | undefined> {
        return this.repo
            .createQueryBuilder('queue')
            .leftJoinAndSelect('queue.user', 'user')
            .where('queue.current < queue.time')
            .orderBy('queue.createdAt', 'ASC')
            .getOne();
    }

    currentAndNextStreams(): Promise<StreamQueueEntity[]> {
        return this.repo
            .createQueryBuilder('queue')
            .select(['queue.time', 'queue.current', 'queue.id'])
            .leftJoin('queue.user', 'user')
            .addSelect(['user.username', 'user.avatar', 'user.displayName'])
            .where('queue.current < queue.time')
            .orderBy('queue.createdAt', 'ASC')
            .getMany();
    }

    async isEmpty(): Promise<boolean> {
        return (await this.currentStream()) == undefined;
    }

    async insert(cost: number, time: number, user: UserEntity) {
        const stream = new StreamQueueEntity();
        stream.amount = cost;
        stream.time = time;
        stream.user = user;
        await this.repo.save(stream);
    }

    async skipCurrent() {
        const stream = await this.currentStream();
        if (stream == undefined) return;

        stream.current = stream.time;
        await this.repo.save(stream);
    }

    @Cron(CronExpression.EVERY_SECOND)
    async updateQueue() {
        const currentStream = await this.currentStream();

        //If queue is empty do nothing
        if (currentStream == undefined) return;

        //Start if null
        if (currentStream.start == null) {
            currentStream.start = new Date();
        }
        //Update current
        else {
            const startTime = Math.round(currentStream.start.getTime() / 1000);
            currentStream.current = Math.round(new Date().getTime() / 1000) - startTime;
        }

        await this.repo.save(currentStream);
    }
}
