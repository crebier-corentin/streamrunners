import { MigrationInterface, QueryRunner } from 'typeorm';

export class Sparkle1587760595686 implements MigrationInterface {
    public name = 'Sparkle1587760595686';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'ALTER TABLE `user` ADD `sparkle` tinyint NOT NULL DEFAULT 0 AFTER `moderator`',
            undefined
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `user` DROP COLUMN `sparkle`', undefined);
    }
}
