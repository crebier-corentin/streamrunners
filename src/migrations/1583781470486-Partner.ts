import { MigrationInterface, QueryRunner } from 'typeorm';

export class Partner1583781470486 implements MigrationInterface {
    public name = 'Partner1583781470486';

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            'CREATE TABLE `partner` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, `image` varchar(255) NOT NULL, `url` varchar(255) NOT NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (`id`)) ENGINE=InnoDB',
            undefined
        );
        await queryRunner.query(
            'ALTER TABLE `stream_queue` CHANGE `start` `start` datetime NULL DEFAULT null',
            undefined
        );
        await queryRunner.query('ALTER TABLE `user` CHANGE `banDate` `banDate` datetime NULL DEFAULT null', undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query('ALTER TABLE `user` CHANGE `banDate` `banDate` datetime NULL', undefined);
        await queryRunner.query('ALTER TABLE `stream_queue` CHANGE `start` `start` datetime NULL', undefined);
        await queryRunner.query('DROP TABLE `partner`', undefined);
    }
}
