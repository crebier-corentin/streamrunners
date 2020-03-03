import { UserErrorException } from '../common/exception/user-error.exception';

export enum CouponExceptionType {
    NotFound,
    Invalid,
    AlreadyUsed,
}

export class CouponException extends UserErrorException {
    public constructor(public readonly type: CouponExceptionType) {
        super();
    }

    public errorMessage(): string {
        switch (this.type) {
            case CouponExceptionType.NotFound:
                return "Le coupon n'existe pas.";
            case CouponExceptionType.Invalid:
                return "Le coupon n'est plus valide.";
            case CouponExceptionType.AlreadyUsed:
                return 'Le coupon est déjà utilisé.';
        }
    }
}
