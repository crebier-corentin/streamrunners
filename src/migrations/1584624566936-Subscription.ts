import { MigrationInterface, QueryRunner } from 'typeorm';

export class Subscription1584624566936 implements MigrationInterface {
    public name = 'Subscription1584624566936';

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            "CREATE TABLE `subscription` (`id` int NOT NULL AUTO_INCREMENT, `paypalId` varchar(255) NOT NULL, `level` enum ('none', 'vip', 'diamond') NOT NULL, `current` tinyint NOT NULL DEFAULT 0, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `userId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB",
            undefined
        );
        await queryRunner.query(
            'ALTER TABLE `subscription` ADD CONSTRAINT `FK_cc906b4bc892b048f1b654d2aa0` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
            undefined
        );
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            'ALTER TABLE `subscription` DROP FOREIGN KEY `FK_cc906b4bc892b048f1b654d2aa0`',
            undefined
        );
        await queryRunner.query('DROP TABLE `subscription`', undefined);
    }
}
