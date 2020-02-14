import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { sanitize } from 'class-sanitizer';

@Injectable()
export class SanitizationPipe implements PipeTransform<any> {
    async transform(value: any, { metatype }: ArgumentMetadata) {
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
