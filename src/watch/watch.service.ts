import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CaseTypeEntity } from '../case/case-type.entity';
import { CaseTypeService } from '../case/case-type.service';
import { CaseService } from '../case/case.service';
import { UserErrorException } from '../common/exception/user-error.exception';
import { StreamQueueService } from '../stream-queue/stream-queue.service';
import { SubscriptionLevelInfoService } from '../subscription/subscription-level-info.service';
import { SubscriptionLevel } from '../subscription/subscription.interfaces';
import { TwitchService } from '../twitch/twitch.service';
import { UserEntity } from '../user/user.entity';
import { NotEnoughPointsException } from '../user/user.exception';
import { UserService } from '../user/user.service';

/**
 * Service taking care of updating points, adding and removing from the stream queue.
 *
 * @category Service
 *
 */
@Injectable()
export class WatchService implements OnApplicationBootstrap {
    //Stores the id first, and then loads the entity in onApplicationBootstrap()
    private affiliateCaseType: number | CaseTypeEntity;

    public constructor(
        private readonly streamQueueService: StreamQueueService,
        private readonly userService: UserService,
        private readonly twitch: TwitchService,
        private readonly caseService: CaseService,
        private readonly caseTypeService: CaseTypeService,
        private readonly subLevelInfoService: SubscriptionLevelInfoService,
        config: ConfigService
    ) {
        this.affiliateCaseType = Number(config.get('AFFILIATE_CASE_ID'));
    }

    public async onApplicationBootstrap(): Promise<void> {
        this.affiliateCaseType = await this.caseTypeService.byIdOrFail(this.affiliateCaseType as number);
    }

    private static pointsMultiplier(lvl: SubscriptionLevel): number {
        switch (lvl) {
            case SubscriptionLevel.None:
                return 1;
            case SubscriptionLevel.VIP:
                return 1.5;
            case SubscriptionLevel.Diamond:
                return 2;
        }
    }

    //Workaround for 1.5x points
    private shouldUseCeil = false;

    /**
     * Rewards user watching the current stream with points and handle giving affiliated case.
     */
    @Cron(CronExpression.EVERY_SECOND)
    public async updatePoints(): Promise<void> {
        //Check if stream is online
        const current = await this.streamQueueService.currentStream();
        if (current == undefined) return;

        //Exclude the stream's owner
        const users = await this.userService.viewers(5, current.user.id);

        for (const user of users) {
            const multiplier = WatchService.pointsMultiplier(user.subscriptionLevel);

            //To deal with 1.5x points, switch between floor and ceil each call
            const points = this.shouldUseCeil ? Math.ceil(multiplier) : Math.floor(multiplier);

            await this.userService.changePointsSave(user, points);

            //Handle affiliate case
            if (user.affiliatedTo != null && !user.gotAffiliateCase && user.points >= 2000) {
                await this.caseService.giveCase(this.affiliateCaseType as CaseTypeEntity, user);
                await this.caseService.giveCase(this.affiliateCaseType as CaseTypeEntity, user.affiliatedTo);

                user.gotAffiliateCase = true;
                await this.userService.save(user);
            }
        }

        this.shouldUseCeil = !this.shouldUseCeil;
    }

    /**
     * Add a new stream to the queue.\
     * Throws if the user has reached the maximum simultaneous places, if the user can't afford the place or if the user's stream isn't online.
     *
     * @param user Owner of the stream place.
     */
    public async addStreamToQueue(user: UserEntity): Promise<void> {
        //Check number of places
        const placesCount = await this.streamQueueService.placesCount(user);
        const placeLimit = this.subLevelInfoService.getPlaceLimit(user.subscriptionLevel);
        if (placesCount >= placeLimit) {
            const limitPlural = placeLimit > 1 ? 's' : '';

            throw new UserErrorException(
                'Nombre de places limite dans la file atteint.',
                `Vous ne pouvez qu'avoir que ${placeLimit} place${limitPlural} simultanée${limitPlural} dans la file.`
            );
        }

        //Check if queue is empty
        const cost = (await this.streamQueueService.isEmpty()) ? 0 : 2000;

        if (!user.canAffordPoints(cost)) throw new NotEnoughPointsException(user, cost, 'La place');

        //Check if stream is online
        if (!(await this.twitch.isStreamOnline(user.twitchId)))
            throw new UserErrorException(
                'Votre stream est hors-ligne.',
                `Votre stream doit être en ligne pour pouvoir vous ajouter dans la queue.`
            );

        await this.streamQueueService.insert(cost, 60 * 10, user);

        //Change points
        await this.userService.changePointsSave(user, -cost);
    }

    /**
     *
     * Remove a stream from the queue and refund the user.
     *
     * @remark
     * Cannot remove a stream that is in first place.
     *
     * @param streamId [[StreamQueueEntity.id]] of the stream.
     * @param user Owner of the stream.
     *
     * @returns if the stream was successfully removed.
     */
    public async removeFromQueue(streamId: number, user: UserEntity): Promise<boolean> {
        const stream = await this.streamQueueService.byIdAndUserIdOrFail(streamId, user.id);

        //Refuse if stream is in first place
        if (stream.id === (await this.streamQueueService.currentStream()).id) return false;

        //Remove stream
        this.streamQueueService.remove(stream);

        //Refund
        await this.userService.changePointsSave(user, stream.amount);

        return true;
    }
}
