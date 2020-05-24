import { MigrationInterface, QueryRunner } from 'typeorm';

export class KeyCategory1590321997778 implements MigrationInterface {
    public name = 'KeyCategory1590321997778';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            "ALTER TABLE `steam_key` ADD `category` varchar(255) NOT NULL DEFAULT 'random' AFTER `code`",
            undefined
        );

        const contentsWithKey = await queryRunner.query(
            "SELECT id FROM `case_content` WHERE `contentType` = 'steam_key'"
        );

        await queryRunner.query('ALTER TABLE `case_content` DROP COLUMN `contentType`', undefined);
        await queryRunner.query(
            'ALTER TABLE `case_content` ADD `keyCategory` varchar(255) NULL DEFAULT NULL AFTER `amountMeteores`',
            undefined
        );

        for (const content of contentsWithKey) {
            await queryRunner.query("UPDATE `case_content` SET `keyCategory` = 'random' WHERE `id` = ?", content.id);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const contentsWithKey = await queryRunner.query(
            'SELECT id FROM `case_content` WHERE `keyCategory` IS NOT NULL'
        );

        await queryRunner.query('ALTER TABLE `case_content` DROP COLUMN `keyCategory`', undefined);
        await queryRunner.query(
            "ALTER TABLE `case_content` ADD `contentType` enum ('points_and_meteores', 'steam_key') NOT NULL DEFAULT 'points_and_meteores'",
            undefined
        );

        for (const content of contentsWithKey) {
            await queryRunner.query("UPDATE `case_content` SET `contentType` = 'steam_key' WHERE `id` = ?", content.id);
        }

        await queryRunner.query('ALTER TABLE `steam_key` DROP COLUMN `category`', undefined);
    }
}
