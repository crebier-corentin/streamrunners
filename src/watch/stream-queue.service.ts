import { StreamQueueEntity } from './stream-queue.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class StreamQueueService {
    constructor(@InjectRepository(StreamQueueEntity) private readonly repo) {}

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
            .addSelect(['user.username', 'user.avatar', 'user.display_name'])
            .where('queue.current < queue.time')
            .orderBy('queue.createdAt', 'ASC')
            .getMany();
    }

    async isEmpty(): Promise<boolean> {
        return (await this.currentStream()) == undefined;
    }

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

        await currentStream.save();
    }
}
