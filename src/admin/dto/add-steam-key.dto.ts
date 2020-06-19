import { ToInt, Trim } from 'class-sanitizer';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

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
    @IsInt()
    @ToInt()
    public categoryId: number;
}
