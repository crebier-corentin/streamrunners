import {MigrationInterface, QueryRunner} from "typeorm";

export class ChatRank1579096974342 implements MigrationInterface {
    name = 'ChatRank1579096974342'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `user` ADD `chatRank` int NOT NULL DEFAULT 0", undefined);
        await queryRunner.query("ALTER TABLE `stream_queue` CHANGE `start` `start` datetime NULL DEFAULT null", undefined);
        await queryRunner.query("ALTER TABLE `user_power` CHANGE `expires` `expires` datetime NULL DEFAULT null", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `user_power` CHANGE `expires` `expires` datetime NULL", undefined);
        await queryRunner.query("ALTER TABLE `stream_queue` CHANGE `start` `start` datetime NULL", undefined);
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `chatRank`", undefined);
    }

}
