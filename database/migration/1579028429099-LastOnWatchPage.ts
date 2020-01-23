import {MigrationInterface, QueryRunner} from "typeorm";

export class LastOnWatchPage1579028429099 implements MigrationInterface {
    name = 'LastOnWatchPage1579028429099'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `user` ADD `lastOnWatchPage` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP", undefined);
        await queryRunner.query("ALTER TABLE `stream_queue` CHANGE `start` `start` datetime NULL DEFAULT null", undefined);
        await queryRunner.query("ALTER TABLE `user_power` CHANGE `expires` `expires` datetime NULL DEFAULT null", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `user_power` CHANGE `expires` `expires` datetime NULL", undefined);
        await queryRunner.query("ALTER TABLE `stream_queue` CHANGE `start` `start` datetime NULL", undefined);
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `lastOnWatchPage`", undefined);
    }

}
