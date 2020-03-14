import { MigrationInterface, QueryRunner } from 'typeorm';

export class StreamerPartner1584202369333 implements MigrationInterface {
    public name = 'StreamerPartner1584202369333';

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            'ALTER TABLE `user` ADD `partner` tinyint NOT NULL DEFAULT 0 AFTER `chatRank`',
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
        await queryRunner.query('ALTER TABLE `user` DROP COLUMN `partner`', undefined);
    }
}
