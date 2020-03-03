import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { sanitize } from 'class-sanitizer';

@Injectable()
export class SanitizationPipe implements PipeTransform<any> {
    public transform(value: any, { metatype }: ArgumentMetadata): any {
        if (metatype && this.toValidate(metatype)) {
            sanitize(value);
        }

        return value;
    }

    private toValidate(metatype: Function): boolean {
        const types: Function[] = [String, Boolean, Number, Array, Object];
        return !types.includes(metatype);
    }
}
