import { ValidationError } from '@nestjs/common';
import { UserErrorException } from './user-error.exception';

/**
 * Exception used to report validation error from ValidationPipe.
 *
 * Will concat all of the error messages into [[message]].
 *
 * ```typescript
 * //In some controller...
 * @UsePipes(new ValidationPipe({exceptionFactory: (errors): ValidationErrorsException => new ValidationErrorsException(errors)})
 * ```
 *
 * @Category Exception
 *
 */
export class ValidationErrorsException extends UserErrorException {
    public constructor(errors: ValidationError[]) {
        let message = 'Erreur de validation :\n';
        for (const error of errors) {
            message += Object.values(error.constraints).join('\n');
            message += `\n`;
        }

        super(message, 422);
    }
}
