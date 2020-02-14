import { User } from '../../decorator/user.decorator';
import { AuthenticatedGuard } from '../../guard/authenticated.guard';
import { ModeratorGuard } from '../../guard/moderator.guard';
import { StreamQueueService } from '../../model/stream-queue/stream-queue.service';
import { UserEntity } from '../../model/user/user.entity';
import { UserService } from '../../model/user/user.service';
import { WatchService } from './watch.service';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { classToPlain } from 'class-transformer';

@UseGuards(AuthenticatedGuard)
@Controller('watch')
export class WatchController {
    constructor(
        private readonly watchService: WatchService,
        private readonly streamQueueService: StreamQueueService,
        private readonly userService: UserService
    ) {}

    @Post('update')
    async update(@User() user: UserEntity) {
        //Update lastOnWatchPage
        user.lastOnWatchPage = new Date();

        await this.watchService.updatePoints(user);

        const [queue, viewers /*mostPoints, mostPlace,*/ /*TODO messages*/] = await Promise.all([
            this.streamQueueService.currentAndNextStreams(), //queue
            this.userService.viewers(), //viewers
            //TODO ChatMessage.getLastMessages() //messages
        ]);

        return {
            auth: true,
            points: user.points,
            queue,
            viewers: classToPlain(viewers),
            //TODO messages
        };
    }

    @Post('add')
    async add(@User() user: UserEntity) {
        const result = await this.watchService.addStreamToQueue(user);

        if (!result.enough) {
            //Add points to reply
            return { ...result, points: user.points };
        }

        return result;
    }

    @Post('delete')
    async delete(@Body('id') id: number, @User() user: UserEntity) {
        return { success: await this.watchService.removeFromQueue(id, user) };
    }

    @UseGuards(ModeratorGuard)
    @Post('skip')
    async skip() {
        await this.streamQueueService.skipCurrent();
    }
}
