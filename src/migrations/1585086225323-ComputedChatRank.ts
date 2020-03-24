import { MigrationInterface, QueryRunner } from 'typeorm';

export class ComputedChatRank1585086225323 implements MigrationInterface {
    public name = 'ComputedChatRank1585086225323';

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query('ALTER TABLE `user` DROP COLUMN  `chatRank`', undefined);
        await queryRunner.query('ALTER TABLE `user` ADD `admin` tinyint NOT NULL DEFAULT 0 AFTER `points`', undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query('ALTER TABLE `user` DROP COLUMN `admin`', undefined);
        await queryRunner.query("ALTER TABLE `user` ADD `chatRank` int NOT NULL DEFAULT '0'", undefined);
    }
}
