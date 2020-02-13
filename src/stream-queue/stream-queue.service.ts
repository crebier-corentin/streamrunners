import { UserEntity } from '../user/user.entity';
import { ModelService } from '../utils/ModelService';
import { StreamQueueEntity } from './stream-queue.entity';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class StreamQueueService extends ModelService<StreamQueueEntity> {
    constructor(@InjectRepository(StreamQueueEntity) repo: Repository<StreamQueueEntity>) {
        super(repo);
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

    async removeFromQueue(streamId: number, user: UserEntity): Promise<{ success: boolean; refund?: number }> {
        const stream = await this.repo
            .createQueryBuilder('queue')
            .leftJoinAndSelect('queue.user', 'user')
            .where('queue.id = :streamId', { streamId })
            .andWhere('user.id = :userId', { userId: user.id })
            .getOne();

        if (stream == undefined || stream.user.id !== user.id) return { success: false };

        if ((await this.currentStream()).id === stream.id) return { success: false };

        //Delete stream
        await this.repo.remove(stream);

        return { success: true, refund: stream.amount };
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
