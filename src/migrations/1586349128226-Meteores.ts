import { MigrationInterface, QueryRunner } from 'typeorm';

export class Meteores1586349128226 implements MigrationInterface {
    public name = 'Meteores1586349128226';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `case_content` DROP COLUMN `amount`', undefined);
        await queryRunner.query(
            'ALTER TABLE `case_content` ADD `amountPoints` int NOT NULL DEFAULT 0 AFTER `chance`',
            undefined
        );
        await queryRunner.query(
            'ALTER TABLE `case_content` ADD `amountMeteores` int NOT NULL DEFAULT 0 AFTER `amountPoints`',
            undefined
        );
        await queryRunner.query('ALTER TABLE `user` ADD `meteores` int NOT NULL DEFAULT 0 AFTER `points`', undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `user` DROP COLUMN `meteores`', undefined);
        await queryRunner.query('ALTER TABLE `case_content` DROP COLUMN `amountMeteores`', undefined);
        await queryRunner.query('ALTER TABLE `case_content` DROP COLUMN `amountPoints`', undefined);
        await queryRunner.query('ALTER TABLE `case_content` ADD `amount` int NULL', undefined);
    }
}
