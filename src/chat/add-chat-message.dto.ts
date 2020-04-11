import { Trim } from 'class-sanitizer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AddChatMessageDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(700)
    @Trim()
    public message: string;
}
