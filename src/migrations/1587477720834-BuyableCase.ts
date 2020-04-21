import { MigrationInterface, QueryRunner } from 'typeorm';

export class BuyableCase1587477720834 implements MigrationInterface {
    public name = 'BuyableCase1587477720834';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP INDEX `IDX_97a643afdc076bcb015d3a2aed` ON `case`', undefined);
        await queryRunner.query(
            'ALTER TABLE `case_type` ADD `buyable` tinyint NOT NULL DEFAULT 0 AFTER `closeImage`',
            undefined
        );
        await queryRunner.query(
            'ALTER TABLE `case_type` ADD `price` int UNSIGNED NOT NULL DEFAULT 0 AFTER `buyable`',
            undefined
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `case_type` DROP COLUMN `price`', undefined);
        await queryRunner.query('ALTER TABLE `case_type` DROP COLUMN `buyable`', undefined);
        await queryRunner.query('CREATE UNIQUE INDEX `IDX_97a643afdc076bcb015d3a2aed` ON `case` (`keyId`)', undefined);
    }
}
