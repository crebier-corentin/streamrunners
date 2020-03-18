import { MigrationInterface, QueryRunner } from 'typeorm';

export class Subscription1584526469774 implements MigrationInterface {
    public name = 'Subscription1584526469774';

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            "CREATE TABLE `subscription` (`id` int NOT NULL AUTO_INCREMENT, `status` enum ('active', 'queued', 'cancelled_active', 'cancelled') NOT NULL, `level` enum ('none', 'vip', 'diamond') NOT NULL, `expires` datetime NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `userId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB",
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
