import { MigrationInterface, QueryRunner } from 'typeorm';

export class Indexes1587580372476 implements MigrationInterface {
    public name = 'Indexes1587580372476';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP INDEX `IDX_3ca7b65f7b821a3e768083ff0a` ON `case_content`', undefined);
        await queryRunner.query(
            'ALTER TABLE `case_type` CHANGE `price` `price` int UNSIGNED NOT NULL DEFAULT 0',
            undefined
        );
        await queryRunner.query('CREATE INDEX `IDX_de886e42e830e587182305b9ca` ON `stream_queue` (`time`)', undefined);
        await queryRunner.query(
            'CREATE INDEX `IDX_2cd5eea8ae549e106fefec611e` ON `stream_queue` (`current`)',
            undefined
        );
        await queryRunner.query(
            'CREATE INDEX `IDX_3b3c2d4c8be24eeb7d3698a982` ON `stream_queue` (`createdAt`)',
            undefined
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP INDEX `IDX_3b3c2d4c8be24eeb7d3698a982` ON `stream_queue`', undefined);
        await queryRunner.query('DROP INDEX `IDX_2cd5eea8ae549e106fefec611e` ON `stream_queue`', undefined);
        await queryRunner.query('DROP INDEX `IDX_de886e42e830e587182305b9ca` ON `stream_queue`', undefined);
        await queryRunner.query(
            "ALTER TABLE `case_type` CHANGE `price` `price` int(10) UNSIGNED NOT NULL DEFAULT '0'",
            undefined
        );
        await queryRunner.query(
            'CREATE UNIQUE INDEX `IDX_3ca7b65f7b821a3e768083ff0a` ON `case_content` (`name`)',
            undefined
        );
    }
}
