import { MigrationInterface, QueryRunner } from 'typeorm';

export class SteamKey1587233971308 implements MigrationInterface {
    public name = 'SteamKey1587233971308';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'CREATE TABLE `steam_key` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, `code` varchar(255) NOT NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX `IDX_e67345ac90d5735c699919245e` (`code`), PRIMARY KEY (`id`)) ENGINE=InnoDB',
            undefined
        );
        await queryRunner.query(
            "ALTER TABLE `case_content` ADD `contentType` enum ('points_and_meteores', 'steam_key') NOT NULL DEFAULT 'points_and_meteores' AFTER `chance`",
            undefined
        );
        await queryRunner.query('ALTER TABLE `case` ADD `keyId` int NULL', undefined);
        await queryRunner.query(
            'ALTER TABLE `case` ADD UNIQUE INDEX `IDX_97a643afdc076bcb015d3a2aed` (`keyId`)',
            undefined
        );
        await queryRunner.query('CREATE UNIQUE INDEX `REL_97a643afdc076bcb015d3a2aed` ON `case` (`keyId`)', undefined);
        await queryRunner.query(
            'ALTER TABLE `case` ADD CONSTRAINT `FK_97a643afdc076bcb015d3a2aed1` FOREIGN KEY (`keyId`) REFERENCES `steam_key`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
            undefined
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `case` DROP FOREIGN KEY `FK_97a643afdc076bcb015d3a2aed1`', undefined);
        await queryRunner.query('DROP INDEX `REL_97a643afdc076bcb015d3a2aed` ON `case`', undefined);
        await queryRunner.query('ALTER TABLE `case` DROP INDEX `IDX_97a643afdc076bcb015d3a2aed`', undefined);
        await queryRunner.query('ALTER TABLE `case` DROP COLUMN `keyId`', undefined);
        await queryRunner.query('ALTER TABLE `case_content` DROP COLUMN `contentType`', undefined);
        await queryRunner.query('DROP INDEX `IDX_e67345ac90d5735c699919245e` ON `steam_key`', undefined);
        await queryRunner.query('DROP TABLE `steam_key`', undefined);
    }
}
