import { MigrationInterface, QueryRunner } from 'typeorm';

export class SubscriptionPaypalId1584547092862 implements MigrationInterface {
    public name = 'SubscriptionPaypalId1584547092862';

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query('ALTER TABLE `user` CHANGE `banDate` `banDate` datetime NULL DEFAULT null', undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query('ALTER TABLE `subscription` DROP COLUMN `paypalId`', undefined);
    }
}
