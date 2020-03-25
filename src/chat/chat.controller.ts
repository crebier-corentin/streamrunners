import { Body, Controller, ParseIntPipe, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { User } from '../common/decorator/user.decorator';
import { AuthenticatedGuard } from '../common/guard/authenticated.guard';
import { ModeratorGuard } from '../common/guard/moderator.guard';
import { SanitizationPipe } from '../common/pipe/sanitization-pipe.service';
import { UserEntity } from '../user/user.entity';
import { AddChatMessageDto } from './add-chat-message.dto';
import { ChatService } from './chat.service';

@UseGuards(AuthenticatedGuard)
@Controller('chat')
export class ChatController {
    public constructor(private readonly chatService: ChatService) {}

    @UsePipes(new ValidationPipe({ disableErrorMessages: true }), SanitizationPipe)
    @Post('add')
    public async addMessage(@Body() body: AddChatMessageDto, @User() user: UserEntity): Promise<void> {
        await this.chatService.addMessage(body.message, user);
    }

    @UseGuards(ModeratorGuard)
    @Post('delete')
    public async softDeleteMessage(
        @Body('messageId', ParseIntPipe) id: number,
        @User() user: UserEntity
    ): Promise<void> {
        await this.chatService.softDeleteChat(id, user);
    }
}
