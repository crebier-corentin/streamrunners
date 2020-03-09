import { Trim } from 'class-sanitizer';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class AddPartnerDto {
    @IsNotEmpty()
    @IsString()
    @Trim()
    public name: string;

    @IsNotEmpty()
    @IsString()
    @Trim()
    public image: string;

    @IsNotEmpty()
    @IsString()
    @IsUrl()
    public url: string;
}
