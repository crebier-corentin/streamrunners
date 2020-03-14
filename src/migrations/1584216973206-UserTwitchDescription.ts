import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserTwitchDescription1584216973206 implements MigrationInterface {
    public name = 'UserTwitchDescription1584216973206';

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            'ALTER TABLE `user` ADD `twitchDescription` varchar(255) NOT NULL AFTER `avatar`',
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
        await queryRunner.query('ALTER TABLE `user` DROP COLUMN `twitchDescription`', undefined);
    }
}
