import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatedAtUpdatedAt1582480954520 implements MigrationInterface {
    public name = 'CreatedAtUpdatedAt1582480954520';

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            'ALTER TABLE `chat_message` ADD `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) AFTER `createdAt`',
            undefined
        );
        await queryRunner.query(
            'ALTER TABLE `coupon` ADD `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)',
            undefined
        );
        await queryRunner.query(
            'ALTER TABLE `coupon` ADD `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)',
            undefined
        );
        await queryRunner.query(
            'ALTER TABLE `raffle` ADD `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) AFTER `createdAt`',
            undefined
        );
        await queryRunner.query(
            'ALTER TABLE `raffle_participation` ADD `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) AFTER `createdAt`',
            undefined
        );
        await queryRunner.query(
            'ALTER TABLE `stream_queue` ADD `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) AFTER `createdAt`',
            undefined
        );
        await queryRunner.query(
            'ALTER TABLE `announcement` ADD `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) AFTER `createdAt`',
            undefined
        );
        await queryRunner.query(
            'ALTER TABLE `discord_user` ADD `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)',
            undefined
        );
        await queryRunner.query(
            'ALTER TABLE `discord_user` ADD `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)',
            undefined
        );
        await queryRunner.query(
            'ALTER TABLE `stream_queue` CHANGE `start` `start` datetime NULL DEFAULT null',
            undefined
        );
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query('ALTER TABLE `stream_queue` CHANGE `start` `start` datetime NULL', undefined);
        await queryRunner.query('ALTER TABLE `discord_user` DROP COLUMN `updatedAt`', undefined);
        await queryRunner.query('ALTER TABLE `discord_user` DROP COLUMN `createdAt`', undefined);
        await queryRunner.query('ALTER TABLE `announcement` DROP COLUMN `updatedAt`', undefined);
        await queryRunner.query('ALTER TABLE `stream_queue` DROP COLUMN `updatedAt`', undefined);
        await queryRunner.query('ALTER TABLE `raffle_participation` DROP COLUMN `updatedAt`', undefined);
        await queryRunner.query('ALTER TABLE `raffle` DROP COLUMN `updatedAt`', undefined);
        await queryRunner.query('ALTER TABLE `coupon` DROP COLUMN `updatedAt`', undefined);
        await queryRunner.query('ALTER TABLE `coupon` DROP COLUMN `createdAt`', undefined);
        await queryRunner.query('ALTER TABLE `chat_message` DROP COLUMN `updatedAt`', undefined);
    }
}
