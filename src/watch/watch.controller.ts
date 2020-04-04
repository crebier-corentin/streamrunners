import { Body, Controller, ParseIntPipe, Post, UseFilters, UseGuards } from '@nestjs/common';
import { classToPlain } from 'class-transformer';
import { ChatService } from '../chat/chat.service';
import { User } from '../common/decorator/user.decorator';
import { JsonUserErrorFilter } from '../common/filter/json-user-error.filter';
import { AuthenticatedGuard } from '../common/guard/authenticated.guard';
import { ModeratorGuard } from '../common/guard/moderator.guard';
import { StreamQueueEntity } from '../stream-queue/stream-queue.entity';
import { StreamQueueService } from '../stream-queue/stream-queue.service';
import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { WatchService } from './watch.service';

@UseGuards(AuthenticatedGuard)
@Controller('watch')
export class WatchController {
    public constructor(
        private readonly watchService: WatchService,
        private readonly streamQueueService: StreamQueueService,
        private readonly userService: UserService,
        private readonly chatService: ChatService
    ) {}

    @Post('update')
    public async update(
        @User() user: UserEntity
    ): Promise<{ viewers: any; auth: boolean; messages: any; queue: StreamQueueEntity[]; points: number }> {
        //Update lastOnWatchPage
        user.lastOnWatchPage = new Date();
        await this.userService.save(user);

        const [queue, viewers, messages] = await Promise.all([
            this.streamQueueService.currentAndNextStreams(), //queue
            this.userService.viewers(30), //viewers
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

    @UseFilters(JsonUserErrorFilter)
    @Post('add')
    public async add(@User() user: UserEntity): Promise<void> {
        await this.watchService.addStreamToQueue(user);
    }

    @Post('delete')
    public async delete(@Body('id', ParseIntPipe) id: number, @User() user: UserEntity): Promise<{ success: boolean }> {
        return { success: await this.watchService.removeFromQueue(id, user) };
    }

    @UseGuards(ModeratorGuard)
    @Post('skip')
    public async skip(): Promise<void> {
        await this.streamQueueService.skipCurrent();
    }
}
