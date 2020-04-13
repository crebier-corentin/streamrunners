import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CaseTypeEntity } from '../case/case-type.entity';
import { CaseTypeService } from '../case/case-type.service';
import { CaseService } from '../case/case.service';
import { UserErrorException } from '../common/exception/user-error.exception';
import { StreamQueueService } from '../stream-queue/stream-queue.service';
import { SubscriptionLevel } from '../subscription/subscription.interfaces';
import { TwitchService } from '../twitch/twitch.service';
import { UserEntity } from '../user/user.entity';
import { NotEnoughPointsException } from '../user/user.exception';
import { UserService } from '../user/user.service';

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

    private static placeLimit(lvl: SubscriptionLevel): number {
        switch (lvl) {
            case SubscriptionLevel.None:
                return 2;
            case SubscriptionLevel.VIP:
                return 4;
            case SubscriptionLevel.Diamond:
                return 6;
        }
    }

    @Cron(CronExpression.EVERY_SECOND)
    public async updatePoints(): Promise<void> {
        //Check if stream is online
        const current = await this.streamQueueService.currentStream();
        if (current == undefined) return;

        //Check if stream is online
        if (!(await this.twitch.isStreamOnline(current.user.twitchId))) return;

        //Exclude the stream's owner
        const users = await this.userService.viewers(5, current.user.id);

        for (const user of users) {
            const multiplier = WatchService.pointsMultiplier(user.subscriptionLevel);
            await this.userService.changePointsSave(user, Math.round(multiplier));

            //Handle affiliate case
            if (user.affiliatedTo != null && !user.gotAffiliateCase && user.points >= 2000) {
                await this.caseService.giveCase(this.affiliateCaseType as CaseTypeEntity, user);
                await this.caseService.giveCase(this.affiliateCaseType as CaseTypeEntity, user.affiliatedTo);

                user.gotAffiliateCase = true;
                await this.userService.save(user);
            }
        }
    }

    public async addStreamToQueue(user: UserEntity): Promise<void> {
        //Check number of places
        const placesCount = await this.streamQueueService.placesCount(user);
        const placeLimit = WatchService.placeLimit(user.subscriptionLevel);
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
