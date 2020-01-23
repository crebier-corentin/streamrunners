import {MigrationInterface, QueryRunner} from "typeorm";

export class chaton1578947296041 implements MigrationInterface {
    name = 'chaton1578947296041'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `stream_queue` CHANGE `start` `start` datetime NULL DEFAULT null", undefined);
        await queryRunner.query("ALTER TABLE `user_power` CHANGE `expires` `expires` datetime NULL DEFAULT null", undefined);
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `display_name`", undefined);
        await queryRunner.query("ALTER TABLE `user` ADD `display_name` varchar(255) NOT NULL", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `display_name`", undefined);
        await queryRunner.query("ALTER TABLE `user` ADD `display_name` varchar(50) NOT NULL DEFAULT '0'", undefined);
        await queryRunner.query("ALTER TABLE `user_power` CHANGE `expires` `expires` datetime NULL", undefined);
        await queryRunner.query("ALTER TABLE `stream_queue` CHANGE `start` `start` datetime NULL", undefined);
    }

}
