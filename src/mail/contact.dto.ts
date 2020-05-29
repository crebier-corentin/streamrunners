import { Trim } from 'class-sanitizer';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ContactDto {
    @IsNotEmpty({ message: 'Le champ email est vide.' })
    @IsEmail(undefined, { message: 'Addresse email invalide.' })
    @MaxLength(400, { message: 'Le champ email ne peut pas avoir plus de 400 caractères.' })
    @Trim()
    public email: string;

    @IsNotEmpty({ message: 'Le champ object est vide.' })
    @IsString()
    @MaxLength(200, { message: 'Le champ object ne peut pas avoir plus de 200 caractères.' })
    @Trim()
    public subject: string;

    @IsNotEmpty({ message: 'Le champ message est vide.' })
    @IsString()
    @MaxLength(5000, { message: 'Le champ message ne peut pas avoir plus de 5000 caractères.' })
    @Trim()
    public message: string;
}
