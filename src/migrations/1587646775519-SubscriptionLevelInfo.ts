import { MigrationInterface, QueryRunner } from 'typeorm';

export class SubscriptionLevelInfo1587646775519 implements MigrationInterface {
    public name = 'SubscriptionLevelInfo1587646775519';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP INDEX `IDX_de886e42e830e587182305b9ca` ON `stream_queue`', undefined); //Index was useless
        await queryRunner.query('DROP INDEX `IDX_2cd5eea8ae549e106fefec611e` ON `stream_queue`', undefined); //Index was useless
        await queryRunner.query(
            "CREATE TABLE `subscription_level_info` (`id` int NOT NULL AUTO_INCREMENT, `level` enum ('none', 'vip', 'diamond') NOT NULL, `maxPlaces` int UNSIGNED NOT NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX `IDX_fa75f38cdcb0c4aecf64f4584e` (`level`), PRIMARY KEY (`id`)) ENGINE=InnoDB",
            undefined
        );
        await queryRunner.query(
            'ALTER TABLE `case_type` CHANGE `price` `price` int UNSIGNED NOT NULL DEFAULT 0',
            undefined
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            "ALTER TABLE `case_type` CHANGE `price` `price` int(10) UNSIGNED NOT NULL DEFAULT '0'",
            undefined
        );
        await queryRunner.query('DROP INDEX `IDX_fa75f38cdcb0c4aecf64f4584e` ON `subscription_level_info`', undefined);
        await queryRunner.query('DROP TABLE `subscription_level_info`', undefined);
        await queryRunner.query(
            'CREATE INDEX `IDX_2cd5eea8ae549e106fefec611e` ON `stream_queue` (`current`)',
            undefined
        );
        await queryRunner.query('CREATE INDEX `IDX_de886e42e830e587182305b9ca` ON `stream_queue` (`time`)', undefined);
    }
}
