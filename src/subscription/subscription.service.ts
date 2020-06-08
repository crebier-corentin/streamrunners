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

/**
 * Entity service for [[SubscriptionEntity]].
 *
 * @category Service
 *
 */
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

    /**
     *
     * @param paypalId [[SubscriptionEntity.paypalId]] of the searched subscription.
     * @param relations Relations to load.
     *
     * @returns The subscription with the searched paypal id or undefined if not found.
     */
    private byPaypalId(
        paypalId: string,
        relations: (keyof SubscriptionEntity)[] = []
    ): Promise<SubscriptionEntity | undefined> {
        return this.repo.findOne({ where: { paypalId }, relations });
    }

    /**
     *
     * Throws if no matching subscription is found.
     *
     * @param paypalId [[SubscriptionEntity.paypalId]] of the searched subscription.
     * @param relations Relations to load.
     * @param exception Exception to throw when no matching subscription is found.
     *
     * @returns The subscription with the searched paypal id.
     */
    private async byPaypalIdOrFail(
        paypalId: string,
        relations: (keyof SubscriptionEntity)[] = [],
        exception: HttpException = new InternalServerErrorException()
    ): Promise<SubscriptionEntity> {
        const entity = await this.byPaypalId(paypalId, relations);

        if (entity == undefined) throw exception;

        return entity;
    }

    /**
     * Creates a paypal subcription and an [[SubscriptionEntity]] associated to it.
     *
     * @param user The user who requested the subscription.
     * @param type The type of the subscription [[SubscriptionType]].
     * @param paypalRequestKey A unique generated string idempotency key. [https://developer.paypal.com/docs/api/reference/api-requests/#paypal-request-id](https://developer.paypal.com/docs/api/reference/api-requests/#paypal-request-id)
     *
     * @returns The subscription's approve paypal url.
     */
    public async createSubscriptionAndGetRedirectUrl(
        user: UserEntity,
        type: string,
        paypalRequestKey: string
    ): Promise<string> {
        //Validate type
        if (type !== SubscriptionLevel.VIP && type !== SubscriptionLevel.Diamond) {
            throw new UserErrorException("Type d'abonnement inconnu.");
        }

        //Check if the user has any active subscriptions
        const current = user.currentSubscription;
        if (current?.isActive) {
            throw new UserErrorException(`Vous avez déjà un abonnement actif (${SubscriptionLevelToFrench(type)}).`);
        }

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
        sub.details = details;
        sub.user = user;
        sub.level = type;
        sub.currentUser = user;

        await this.save(sub, { listeners: false, reload: false });

        //Return approve redirect link
        return details.links.find(l => l.rel === 'approve').href;
    }

    /**
     * Cancel a pending subscription.\
     * Will not work if the subscription's status is not APPROVAL_PENDING
     * @param user The user who requested the cancel.
     * @param paypalId The [[SubscriptionEntity.paypalId]] of the subscription to cancel.
     */
    public async cancelPending(user: UserEntity, paypalId: string): Promise<void> {
        const sub = await this.byPaypalIdOrFail(paypalId, ['user'], new BadRequestException());

        if (sub.user.id != user.id) throw new BadRequestException();

        //Can't disable active sub
        if (sub.details?.status !== 'APPROVAL_PENDING') throw new BadRequestException();

        sub.currentUser = null;
        await this.repo.save(sub);
    }

    /**
     * Cancel the user's [[UserEntity.currentSubscription]].
     * @param user The user who requested the cancel.
     */
    public async cancelCurrent(user: UserEntity): Promise<void> {
        if (user.currentSubscription == undefined) throw new UserErrorException("Vous n'avez pas d'abonnement actif.");

        if (user.currentSubscription.details.status !== 'ACTIVE')
            throw new UserErrorException("Votre abonnement n'est pas actif.");

        await this.paypal.cancelSubscription(user.currentSubscription.paypalId, '');

        user.currentSubscription.details = await this.paypal.getSubscriptionDetails(user.currentSubscription.paypalId);
        await this.save(user.currentSubscription);
    }

    /**
     * Updates [[SubscriptionEntity.details]].\
     * Throws if the subscription does not exist, does not belong to the user or is not active.
     *
     * @param user The owner of the subscription.
     * @param paypalId The [[SubscriptionEntity.paypalId]] of the subscription to check.
     */
    public async isActiveOrFail(user: UserEntity, paypalId: string): Promise<void> {
        const sub = await this.byPaypalIdOrFail(paypalId, ['user'], new BadRequestException());

        if (sub.user.id !== user.id) throw new BadRequestException();

        sub.details = await this.paypal.getSubscriptionDetails(sub.paypalId);
        sub.lastDetailsUpdate = new Date();
        await this.save(sub);

        if (sub.details.status !== 'APPROVED' && sub.details.status !== 'ACTIVE') throw new BadRequestException();
    }
}
