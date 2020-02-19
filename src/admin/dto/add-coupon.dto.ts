import { ToDate, ToInt, Trim } from 'class-sanitizer';
import { IsDate, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class AddCouponDto {
    @IsNotEmpty()
    @IsString()
    @Trim()
    public name: string;

    @Min(1)
    @IsNumber()
    @ToInt()
    public amount: number;

    @Min(1)
    @IsNumber()
    @ToInt()
    public max: number;

    @IsDate()
    @ToDate()
    public expires: Date;
}
