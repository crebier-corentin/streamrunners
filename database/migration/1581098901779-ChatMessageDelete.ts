import {MigrationInterface, QueryRunner} from "typeorm";

export class ChatMessageDelete1581098901779 implements MigrationInterface {
    name = 'ChatMessageDelete1581098901779'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `chat_message` ADD `deletedById` int NULL", undefined);
        await queryRunner.query("ALTER TABLE `stream_queue` CHANGE `start` `start` datetime NULL DEFAULT null", undefined);
        await queryRunner.query("ALTER TABLE `user_power` CHANGE `expires` `expires` datetime NULL DEFAULT null", undefined);
        await queryRunner.query("ALTER TABLE `chat_message` ADD CONSTRAINT `FK_6276cdd7426a4ddbf6c24df2e6b` FOREIGN KEY (`deletedById`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `chat_message` DROP FOREIGN KEY `FK_6276cdd7426a4ddbf6c24df2e6b`", undefined);
        await queryRunner.query("ALTER TABLE `user_power` CHANGE `expires` `expires` datetime NULL", undefined);
        await queryRunner.query("ALTER TABLE `stream_queue` CHANGE `start` `start` datetime NULL", undefined);
        await queryRunner.query("ALTER TABLE `chat_message` DROP COLUMN `deletedById`", undefined);
    }

}
