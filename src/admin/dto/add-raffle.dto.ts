import { ToDate, ToInt, Trim } from 'class-sanitizer';
import { IsDate, IsDateString, IsEmpty, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class AddRaffleDto {
    @IsNotEmpty()
    @IsString()
    @Trim()
    public title: string;

    @IsOptional()
    @IsString()
    @Trim()
    public description: string | null;

    @IsNotEmpty()
    @IsString()
    @Trim()
    public icon: string;

    @Min(1)
    @IsNumber()
    @ToInt()
    public price: number;

    @Min(-1)
    @IsNumber()
    @ToInt()
    public maxTickets: number;

    @IsDate()
    @ToDate()
    public endingDate: Date;

    @IsOptional()
    @IsString()
    @Trim()
    public code: string;

    @Min(0)
    @IsNumber()
    @ToInt()
    public value: number;
}
