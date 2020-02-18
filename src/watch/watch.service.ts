import { StreamQueueService } from '../stream-queue/stream-queue.service';
import { TwitchService } from '../twitch/twitch.service';
import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { Injectable } from '@nestjs/common';
import * as moment from 'moment';

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
            const isOnline = await this.twitch.isStreamOnline(current.user.twitchId);
            if (!isOnline) return;

            const now = moment();

            //If lastUpdate was one minutes or less ago
            if (moment(user.lastUpdate).add(1, 'minutes') >= now) {
                await user.changePoints((now.toDate().getTime() - user.lastUpdate.getTime()) / 1000);
            }

            user.lastUpdate = now.toDate();
        } finally {
            //Always save user even if early return
            await this.userService.save(user);
        }
    }

    public async addStreamToQueue(user: UserEntity): Promise<{ enough: boolean; cost?: number }> {
        //Check if queue is empty
        const cost = (await this.streamQueueService.isEmpty()) ? 0 : 1000;

        //Check if enough points
        if (user.points < cost) {
            //Not enough point
            return { enough: false, cost };
        }

        //Enough point
        await this.streamQueueService.insert(cost, 60 * 10, user);

        //Change points
        await user.changePoints(-cost);
        await this.userService.save(user);

        //TODO: Discord
        //await DiscordBot.sendStreamNotificationMessage();

        return { enough: true };
    }

    public async removeFromQueue(streamId: number, user: UserEntity): Promise<boolean> {
        const stream = await this.streamQueueService.byIdAndUserIdOrFail(streamId, user.id);

        //Refuse if stream is in first place
        if (stream.id === (await this.streamQueueService.currentStream()).id) return false;

        //Remove stream
        this.streamQueueService.remove(stream);

        //Refund
        this.userService.changePointsSave(user, stream.amount);

        return true;
    }
}
