import { MigrationInterface, QueryRunner } from 'typeorm';
import { SubscriptionLevel } from '../subscription/subscription.interfaces';

export class SubscriptionLevelInfoDefaultRows1591039125699 implements MigrationInterface {
    public name = 'SubscriptionLevelInfoDefaultRows1591039125699';

    public async up(queryRunner: QueryRunner): Promise<any> {
        const levels = [
            {
                level: SubscriptionLevel.None,
                maxPlaces: 1,
            },
            {
                level: SubscriptionLevel.VIP,
                maxPlaces: 2,
            },
            {
                level: SubscriptionLevel.Diamond,
                maxPlaces: 4,
            },
        ];
        for (const level of levels) {
            await queryRunner.query(
                'INSERT INTO `subscription_level_info` (level, maxPlaces)  VALUE (? , ?) ON DUPLICATE KEY UPDATE id=id',
                [level.level, level.maxPlaces]
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        //Removing the rows could cause some issues, so better not to
    }
}
