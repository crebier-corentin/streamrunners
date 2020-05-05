import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChatMentions1588665459873 implements MigrationInterface {
    public name = 'ChatMentions1588665459873';

    public async up(queryRunner: QueryRunner): Promise<void> {
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

    public async down(queryRunner: QueryRunner): Promise<void> {
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
    }
}
