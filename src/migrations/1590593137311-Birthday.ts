import { MigrationInterface, QueryRunner } from 'typeorm';

export class Birthday1590593137311 implements MigrationInterface {
    public name = 'Birthday1590593137311';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'ALTER TABLE `user` ADD `birthday` tinyint NOT NULL DEFAULT 0 AFTER `lastOnWatchPage`',
            undefined
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `user` DROP COLUMN `birthday`', undefined);
    }
}
