import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Trim } from 'class-sanitizer';

export class AddChatMessageDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(200)
    @Trim()
    message: string;
}
