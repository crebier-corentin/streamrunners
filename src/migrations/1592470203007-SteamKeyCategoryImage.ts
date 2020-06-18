import { MigrationInterface, QueryRunner } from 'typeorm';

export class SteamKeyCategoryImage1592470203007 implements MigrationInterface {
    public name = 'SteamKeyCategoryImage1592470203007';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `steam_key_category` ADD `image` varchar(255) NOT NULL');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `steam_key_category` DROP COLUMN `image`');
    }
}
