import { MigrationInterface, QueryRunner } from 'typeorm';

export class Chat1581692651008 implements MigrationInterface {
    name = 'Chat1581692651008';

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            'ALTER TABLE `stream_queue` DROP FOREIGN KEY `FK_15e0a2998ef676ce66b2d91b677`',
            undefined
        );
        await queryRunner.query(
            'CREATE TABLE `chat_message` (`id` int NOT NULL AUTO_INCREMENT, `message` varchar(255) NOT NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `authorId` int NULL, `deletedById` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB',
            undefined
        );
        await queryRunner.query(
            'ALTER TABLE `stream_queue` CHANGE `start` `start` datetime NULL DEFAULT null',
            undefined
        );
        await queryRunner.query(
            'ALTER TABLE `stream_queue` ADD CONSTRAINT `FK_4c57791f489aeae47721e7885c2` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
            undefined
        );
        await queryRunner.query(
            'ALTER TABLE `chat_message` ADD CONSTRAINT `FK_a903a8a4b209d820a333e6d537c` FOREIGN KEY (`authorId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
            undefined
        );
        await queryRunner.query(
            'ALTER TABLE `chat_message` ADD CONSTRAINT `FK_6276cdd7426a4ddbf6c24df2e6b` FOREIGN KEY (`deletedById`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
            undefined
        );
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            'ALTER TABLE `chat_message` DROP FOREIGN KEY `FK_6276cdd7426a4ddbf6c24df2e6b`',
            undefined
        );
        await queryRunner.query(
            'ALTER TABLE `chat_message` DROP FOREIGN KEY `FK_a903a8a4b209d820a333e6d537c`',
            undefined
        );
        await queryRunner.query(
            'ALTER TABLE `stream_queue` DROP FOREIGN KEY `FK_4c57791f489aeae47721e7885c2`',
            undefined
        );
        await queryRunner.query('ALTER TABLE `stream_queue` CHANGE `start` `start` datetime NULL', undefined);
        await queryRunner.query('DROP TABLE `chat_message`', undefined);
        await queryRunner.query(
            'ALTER TABLE `stream_queue` ADD CONSTRAINT `FK_15e0a2998ef676ce66b2d91b677` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
            undefined
        );
    }
}
