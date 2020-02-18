import { MigrationInterface, QueryRunner } from 'typeorm';

export class Announcement1582031380121 implements MigrationInterface {
    public name = 'Announcement1582031380121';

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            'CREATE TABLE `announcement` (`id` int NOT NULL AUTO_INCREMENT, `text` varchar(255) NOT NULL, `color` varchar(255) NOT NULL, `url` varchar(255) NOT NULL, `active` tinyint NOT NULL DEFAULT 0, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `createdById` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB',
            undefined
        );
        await queryRunner.query(
            'ALTER TABLE `stream_queue` CHANGE `start` `start` datetime NULL DEFAULT null',
            undefined
        );
        await queryRunner.query(
            'ALTER TABLE `announcement` ADD CONSTRAINT `FK_30893a8cb5ee25374cfd9de9273` FOREIGN KEY (`createdById`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
            undefined
        );
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            'ALTER TABLE `announcement` DROP FOREIGN KEY `FK_30893a8cb5ee25374cfd9de9273`',
            undefined
        );
        await queryRunner.query('ALTER TABLE `stream_queue` CHANGE `start` `start` datetime NULL', undefined);
        await queryRunner.query('DROP TABLE `announcement`', undefined);
    }
}
