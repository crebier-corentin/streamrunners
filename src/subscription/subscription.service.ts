/* eslint-disable @typescript-eslint/camelcase */
import { BadRequestException, HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { UserErrorException } from '../common/exception/user-error.exception';
import { EntityService } from '../common/utils/entity-service';
import { UserEntity } from '../user/user.entity';
import { PaypalService } from './paypal.service';
import { SubscriptionEntity } from './subscription.entity';
import { SubscriptionLevel, SubscriptionLevelToFrench, SubscriptionType } from './subscription.interfaces';

@Injectable()
export class SubscriptionService extends EntityService<SubscriptionEntity> {
    private plans: Map<SubscriptionType, string>;

    private returnUrl: string;
    private cancelUrl: string;

    public constructor(
        @InjectRepository(SubscriptionEntity) repo,
        config: ConfigService,
        private readonly paypal: PaypalService
    ) {
        super(repo);

        this.plans = new Map<SubscriptionType, string>();
        this.plans.set(SubscriptionLevel.VIP, config.get('VIP_PLAN_ID'));
        this.plans.set(SubscriptionLevel.Diamond, config.get('DIAMOND_PLAN_ID'));

        this.returnUrl = `${config.get('HOSTNAME')}/subscription/paypal/return`;
        this.cancelUrl = `${config.get('HOSTNAME')}/subscription/paypal/cancel`;
    }

    private byPaypalId(
        paypalId: string,
        relations: (keyof SubscriptionEntity)[] = []
    ): Promise<SubscriptionEntity | undefined> {
        return this.repo.findOne({ where: { paypalId }, relations });
    }

    private async byPaypalIdOrFail(
        paypalId: string,
        relations: (keyof SubscriptionEntity)[] = [],
        exception: HttpException = new InternalServerErrorException()
    ): Promise<SubscriptionEntity> {
        const entity = await this.byPaypalId(paypalId, relations);

        if (entity == undefined) throw exception;

        return entity;
    }

    public getCurrentSubscription(user: UserEntity): Promise<SubscriptionEntity | undefined> {
        return this.repo
            .createQueryBuilder('sub')
            .leftJoin('sub.user', 'user')
            .where('user.id = :userId', { userId: user.id })
            .andWhere('sub.current = true')
            .getOne();
    }

    public async createSubscriptionAndGetRedirectUrl(
        user: UserEntity,
        type: string,
        paypalRequestKey: string
    ): Promise<string> {
        //Validate type
        if (type !== SubscriptionLevel.VIP && type !== SubscriptionLevel.Diamond)
            throw new UserErrorException("Type d'abonnement inconnu.");

        //Check if the user has any active subscriptions
        const current = await this.getCurrentSubscription(user);
        if (current?.isActive())
            throw new UserErrorException(`Vous avez déjà un abonnement actif (${SubscriptionLevelToFrench(type)}).`);

        //Create paypal sub
        const details = await this.paypal.createSubscription(
            {
                plan_id: this.plans.get(type),
                application_context: {
                    brand_name: 'Streamrunners',
                    locale: 'fr-FR',
                    shipping_preference: 'NO_SHIPPING',
                    payment_method: {
                        payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED',
                        payer_selected: 'PAYPAL',
                    },
                    return_url: this.returnUrl,
                    cancel_url: this.cancelUrl,
                },
            },
            'minimal',
            paypalRequestKey
        );

        const sub = new SubscriptionEntity();
        sub.paypalId = details.id;
        sub.user = user;
        sub.level = type;
        sub.current = true;

        await this.save(sub);

        //Return approve redirect link
        return details.links.find(l => l.rel === 'approve').href;
    }

    public async cancelPending(user: UserEntity, paypalId: string): Promise<void> {
        const sub = await this.byPaypalIdOrFail(paypalId, ['user'], new BadRequestException());

        if (sub.user.id != user.id) throw new BadRequestException();

        //Can't disable active sub
        if (sub.details?.status !== 'APPROVAL_PENDING') throw new BadRequestException();

        sub.current = false;
        await this.repo.save(sub);
    }

    public async cancelCurrent(user: UserEntity): Promise<void> {
        if (user.currentSubscription == undefined) throw new UserErrorException("Vous n'avez pas d'abonnement actif.");

        if (user.currentSubscription.details.status !== 'ACTIVE')
            throw new UserErrorException("Votre abonnement n'est pas actif.");

        await this.paypal.cancelSubscription(user.currentSubscription.paypalId, '');
    }
}
