import { MigrationInterface, QueryRunner } from 'typeorm';

export class Ban1583245942229 implements MigrationInterface {
    public name = 'Ban1583245942229';

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query('ALTER TABLE `user` ADD `bannedById` int NULL AFTER `chatRank`', undefined);
        await queryRunner.query(
            'ALTER TABLE `user` ADD `banDate` datetime NULL DEFAULT null AFTER `bannedById`',
            undefined
        );
        await queryRunner.query(
            'ALTER TABLE `stream_queue` CHANGE `start` `start` datetime NULL DEFAULT null',
            undefined
        );
        await queryRunner.query(
            'ALTER TABLE `user` ADD CONSTRAINT `FK_5c0d97fb536adaf7e8ae299dd7b` FOREIGN KEY (`bannedById`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
            undefined
        );
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query('ALTER TABLE `user` DROP FOREIGN KEY `FK_5c0d97fb536adaf7e8ae299dd7b`', undefined);
        await queryRunner.query('ALTER TABLE `stream_queue` CHANGE `start` `start` datetime NULL', undefined);
        await queryRunner.query('ALTER TABLE `user` DROP COLUMN `banDate`', undefined);
        await queryRunner.query('ALTER TABLE `user` DROP COLUMN `bannedById`', undefined);
    }
}
