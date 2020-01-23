import {MigrationInterface, QueryRunner} from "typeorm";

export class chat1578853319768 implements MigrationInterface {
    name = 'chat1578853319768'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("CREATE TABLE `chat_message` (`id` int NOT NULL AUTO_INCREMENT, `message` varchar(255) NOT NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `authorId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
        await queryRunner.query("ALTER TABLE `stream_queue` CHANGE `start` `start` datetime NULL DEFAULT null", undefined);
        await queryRunner.query("ALTER TABLE `user_power` CHANGE `expires` `expires` datetime NULL DEFAULT null", undefined);
        await queryRunner.query("ALTER TABLE `chat_message` ADD CONSTRAINT `FK_a903a8a4b209d820a333e6d537c` FOREIGN KEY (`authorId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `chat_message` DROP FOREIGN KEY `FK_a903a8a4b209d820a333e6d537c`", undefined);
        await queryRunner.query("ALTER TABLE `user_power` CHANGE `expires` `expires` datetime NULL", undefined);
        await queryRunner.query("ALTER TABLE `stream_queue` CHANGE `start` `start` datetime NULL", undefined);
        await queryRunner.query("DROP TABLE `chat_message`", undefined);
    }

}
