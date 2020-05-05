import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChatMentionTable1588678458627 implements MigrationInterface {
    public name = 'ChatMentionTable1588678458627';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'ALTER TABLE `chat_mentions` DROP FOREIGN KEY `FK_ebb6d3bf614be0ca7d26163d500`',
            undefined
        );
        await queryRunner.query(
            'ALTER TABLE `chat_mentions` DROP FOREIGN KEY `FK_f455876a8fd184c246491306f1a`',
            undefined
        );
        await queryRunner.query('DROP INDEX `IDX_ebb6d3bf614be0ca7d26163d50` ON `chat_mentions`', undefined);
        await queryRunner.query('DROP INDEX `IDX_f455876a8fd184c246491306f1` ON `chat_mentions`', undefined);
        await queryRunner.query('DROP TABLE `chat_mentions`', undefined);

        await queryRunner.query(
            'CREATE TABLE `chat_mention` (`id` int NOT NULL AUTO_INCREMENT, `start` int UNSIGNED NOT NULL, `end` int UNSIGNED NOT NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `messageId` int NOT NULL, `userId` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB',
            undefined
        );
        await queryRunner.query(
            'ALTER TABLE `chat_mention` ADD CONSTRAINT `FK_b49a614ede7e92bf20108175f49` FOREIGN KEY (`messageId`) REFERENCES `chat_message`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
            undefined
        );
        await queryRunner.query(
            'ALTER TABLE `chat_mention` ADD CONSTRAINT `FK_aeaae64ba7588296e2ef648b243` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
            undefined
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'ALTER TABLE `chat_mention` DROP FOREIGN KEY `FK_aeaae64ba7588296e2ef648b243`',
            undefined
        );
        await queryRunner.query(
            'ALTER TABLE `chat_mention` DROP FOREIGN KEY `FK_b49a614ede7e92bf20108175f49`',
            undefined
        );
        await queryRunner.query('DROP TABLE `chat_mention`', undefined);

        await queryRunner.query(
            'CREATE TABLE `chat_mentions` (`chatMessageId` int NOT NULL, `userId` int NOT NULL, INDEX `IDX_f455876a8fd184c246491306f1` (`chatMessageId`), INDEX `IDX_ebb6d3bf614be0ca7d26163d50` (`userId`), PRIMARY KEY (`chatMessageId`, `userId`)) ENGINE=InnoDB',
            undefined
        );
        await queryRunner.query(
            'ALTER TABLE `chat_mentions` ADD CONSTRAINT `FK_f455876a8fd184c246491306f1a` FOREIGN KEY (`chatMessageId`) REFERENCES `chat_message`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
            undefined
        );
        await queryRunner.query(
            'ALTER TABLE `chat_mentions` ADD CONSTRAINT `FK_ebb6d3bf614be0ca7d26163d500` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
            undefined
        );
    }
}
