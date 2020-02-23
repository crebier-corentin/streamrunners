import { Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { StreamQueueService } from '../stream-queue/stream-queue.service';
import { TwitchService } from '../twitch/twitch.service';
import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class WatchService {
    public constructor(
        private readonly streamQueueService: StreamQueueService,
        private readonly userService: UserService,
        private readonly twitch: TwitchService
    ) {}

    public async updatePoints(user: UserEntity): Promise<void> {
        try {
            //Check if stream is online
            const current = await this.streamQueueService.currentStream();

            //Check if stream and is not self stream
            if (current == undefined || current.user.id === user.id) return;

            //Check if stream is online
            if (!(await this.twitch.isStreamOnline(current.user.twitchId))) return;

            const now = moment();

            //If lastUpdate was one minutes or less ago
            if (moment(user.lastUpdate).add(5, 'seconds') >= now) {
                await user.changePoints((now.toDate().getTime() - user.lastUpdate.getTime()) / 1000);
            }

            user.lastUpdate = now.toDate();
        } finally {
            //Always save user even if early return
            await this.userService.save(user);
        }
    }

    public async addStreamToQueue(user: UserEntity): Promise<void> {
        //Check if queue is empty
        const cost = (await this.streamQueueService.isEmpty()) ? 0 : 1000;

        user.canAffordOrFail(cost);

        await this.streamQueueService.insert(cost, 60 * 10, user);

        //Change points
        await this.userService.changePointsSave(user, -cost);
    }

    public async removeFromQueue(streamId: number, user: UserEntity): Promise<boolean> {
        const stream = await this.streamQueueService.byIdAndUserIdOrFail(streamId, user.id);

        //Refuse if stream is in first place
        if (stream.id === (await this.streamQueueService.currentStream()).id) return false;

        //Remove stream
        this.streamQueueService.remove(stream);

        //Refund
        await this.userService.changePointsSave(user, stream.amount);

        return true;
    }
}
