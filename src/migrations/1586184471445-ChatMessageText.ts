import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChatMessageTextText1586184471445 implements MigrationInterface {
    public name = 'ChatMessageText1586184471445'; //Timestamp changed to avoid conflicts with "case" git branch

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `chat_message` DROP COLUMN `message`', undefined);
        await queryRunner.query('ALTER TABLE `chat_message` ADD `message` text NOT NULL', undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `chat_message` DROP COLUMN `message`', undefined);
        await queryRunner.query('ALTER TABLE `chat_message` ADD `message` varchar(255) NOT NULL', undefined);
    }
}
