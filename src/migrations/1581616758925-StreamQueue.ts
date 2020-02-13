import { MigrationInterface, QueryRunner } from 'typeorm';

export class StreamQueue1581616758925 implements MigrationInterface {
    name = 'StreamQueue1581616758925';

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            'CREATE TABLE `stream_queue_entity` (`id` int NOT NULL AUTO_INCREMENT, `amount` int NOT NULL DEFAULT 100, `time` int NOT NULL DEFAULT 60, `current` int NOT NULL DEFAULT 0, `start` datetime NULL DEFAULT null, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `userId` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB',
            undefined
        );
        await queryRunner.query(
            'ALTER TABLE `stream_queue_entity` ADD CONSTRAINT `FK_15e0a2998ef676ce66b2d91b677` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
            undefined
        );
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            'ALTER TABLE `stream_queue_entity` DROP FOREIGN KEY `FK_15e0a2998ef676ce66b2d91b677`',
            undefined
        );
        await queryRunner.query('DROP TABLE `stream_queue_entity`', undefined);
    }
}
