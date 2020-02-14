import { User } from '../decorator/user.decorator';
import { AuthenticatedGuard } from '../guard/authenticated.guard';
import { ModeratorGuard } from '../guard/moderator.guard';
import { StreamQueueService } from '../stream-queue/stream-queue.service';
import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { WatchService } from './watch.service';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { classToPlain } from 'class-transformer';
import { ChatService } from '../chat/chat.service';

@UseGuards(AuthenticatedGuard)
@Controller('watch')
export class WatchController {
    constructor(
        private readonly watchService: WatchService,
        private readonly streamQueueService: StreamQueueService,
        private readonly userService: UserService,
        private readonly chatService: ChatService
    ) {}

    @Post('update')
    async update(@User() user: UserEntity) {
        //Update lastOnWatchPage
        user.lastOnWatchPage = new Date();

        await this.watchService.updatePoints(user);

        const [queue, viewers, messages] = await Promise.all([
            this.streamQueueService.currentAndNextStreams(), //queue
            this.userService.viewers(), //viewers
            this.chatService.getLastMessages(), //messages
        ]);

        return {
            auth: true,
            points: user.points,
            queue,
            viewers: classToPlain(viewers),
            messages: classToPlain(messages),
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
