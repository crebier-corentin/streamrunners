import { Trim } from 'class-sanitizer';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class AddAnnouncementDto {
    @IsNotEmpty()
    @IsString()
    @Trim()
    public text: string;

    @IsNotEmpty()
    @IsString()
    public color: string;

    @IsNotEmpty()
    @IsString()
    @IsUrl()
    public url: string;
}
