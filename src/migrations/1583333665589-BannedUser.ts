import { MigrationInterface, QueryRunner } from 'typeorm';

export class BannedUser1583333665589 implements MigrationInterface {
    public name = 'BannedUser1583333665589';

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            'ALTER TABLE `user` ADD `banned` tinyint NOT NULL DEFAULT 0 AFTER `chatRank`',
            undefined
        );
        await queryRunner.query(
            'ALTER TABLE `stream_queue` CHANGE `start` `start` datetime NULL DEFAULT null',
            undefined
        );
        await queryRunner.query('ALTER TABLE `user` CHANGE `banDate` `banDate` datetime NULL DEFAULT null', undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query('ALTER TABLE `user` CHANGE `banDate` `banDate` datetime NULL', undefined);
        await queryRunner.query('ALTER TABLE `stream_queue` CHANGE `start` `start` datetime NULL', undefined);
        await queryRunner.query('ALTER TABLE `user` DROP COLUMN `banned`', undefined);
    }
}
