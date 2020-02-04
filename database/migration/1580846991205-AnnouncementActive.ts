import {MigrationInterface, QueryRunner} from "typeorm";

export class AnnouncementActive1580846991205 implements MigrationInterface {
    name = 'AnnouncementActive1580846991205'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `announcement` ADD `active` tinyint NOT NULL DEFAULT 0", undefined);
        await queryRunner.query("ALTER TABLE `stream_queue` CHANGE `start` `start` datetime NULL DEFAULT null", undefined);
        await queryRunner.query("ALTER TABLE `user_power` CHANGE `expires` `expires` datetime NULL DEFAULT null", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `user_power` CHANGE `expires` `expires` datetime NULL", undefined);
        await queryRunner.query("ALTER TABLE `stream_queue` CHANGE `start` `start` datetime NULL", undefined);
        await queryRunner.query("ALTER TABLE `announcement` DROP COLUMN `active`", undefined);
    }

}
