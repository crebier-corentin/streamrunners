import { Body, Controller, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AddChatMessageDto } from './add-chat-message.dto';
import { SanitizationPipe } from '../pipe/sanitization-pipe.service';
import { ChatService } from './chat.service';
import { UserEntity } from '../user/user.entity';
import { User } from '../decorator/user.decorator';
import { AuthenticatedGuard } from '../guard/authenticated.guard';
import { ModeratorGuard } from '../guard/moderator.guard';

@UseGuards(AuthenticatedGuard)
@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @UsePipes(new ValidationPipe({ disableErrorMessages: true }), SanitizationPipe)
    @Post('add')
    async addMessage(@Body() body: AddChatMessageDto, @User() user: UserEntity) {
        await this.chatService.addMessage(body.message, user);
    }

    @UseGuards(ModeratorGuard)
    @Post('delete')
    async softDeleteMessage(@Body('messageId') id: number, @User() user: UserEntity) {
        await this.chatService.softDelete(id, user);
    }
}