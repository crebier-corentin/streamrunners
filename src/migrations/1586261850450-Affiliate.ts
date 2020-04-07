import { MigrationInterface, QueryRunner } from 'typeorm';

export class Affiliate1586261850450 implements MigrationInterface {
    public name = 'Affiliate1586261850450';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'ALTER TABLE `user` ADD `gotAffiliateCase` tinyint NOT NULL DEFAULT 0 AFTER `banDate`',
            undefined
        );
        await queryRunner.query('ALTER TABLE `user` ADD `affiliatedToId` int NULL', undefined);
        await queryRunner.query(
            'ALTER TABLE `user` ADD CONSTRAINT `FK_db3d13d5c228f6926f683ee9415` FOREIGN KEY (`affiliatedToId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
            undefined
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `user` DROP FOREIGN KEY `FK_db3d13d5c228f6926f683ee9415`', undefined);
        await queryRunner.query('ALTER TABLE `user` DROP COLUMN `affiliatedToId`', undefined);
        await queryRunner.query('ALTER TABLE `user` DROP COLUMN `gotAffiliateCase`', undefined);
    }
}
