import { Trim } from 'class-sanitizer';
import { IsAlphanumeric, IsNotEmpty, IsString } from 'class-validator';

export class AddSteamKeyDto {
    @IsNotEmpty()
    @IsString()
    @Trim()
    public name: string;

    @IsNotEmpty()
    @IsString()
    @Trim()
    public code: string;

    @IsNotEmpty()
    @IsString()
    @IsAlphanumeric()
    @Trim()
    public category: string;
}
