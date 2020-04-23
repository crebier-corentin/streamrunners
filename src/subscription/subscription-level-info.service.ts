import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityService } from '../common/utils/entity-service';
import { SubscriptionLevelInfoEntity } from './subscription-level-info.entity';
import { SubscriptionLevel } from './subscription.interfaces';

@Injectable()
export class SubscriptionLevelInfoService extends EntityService<SubscriptionLevelInfoEntity>
    implements OnApplicationBootstrap {
    private readonly placeCache = new Map<SubscriptionLevel, number>();

    public constructor(@InjectRepository(SubscriptionLevelInfoEntity) repo) {
        super(repo);
    }

    public async onApplicationBootstrap(): Promise<void> {
        for (const level of Object.values(SubscriptionLevel)) {
            const info = await this.byLevel(level);
            if (info == undefined) throw new Error(`Missing subscription_level_info for ${level}`);

            this.placeCache.set(level, info.maxPlaces);
        }
    }

    public byLevel(level: SubscriptionLevel): Promise<SubscriptionLevelInfoEntity | undefined> {
        return this.repo.findOne({ where: { level } });
    }

    public getPlaceLimit(level: SubscriptionLevel): number {
        return this.placeCache.get(level);
    }

    public async setPlaceLimit(level: SubscriptionLevel, limit: number): Promise<void> {
        await this.repo.update({ level }, { maxPlaces: limit });
        this.placeCache.set(level, limit);
    }
}
