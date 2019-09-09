import {MigrationInterface, QueryRunner} from "typeorm";

export class RemoveEmail1568048493734 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `email`");
        await queryRunner.query("ALTER TABLE `stream_queue` CHANGE `start` `start` datetime NULL");
        await queryRunner.query("ALTER TABLE `coupon` CHANGE `expires` `expires` datetime NOT NULL");
        await queryRunner.query("ALTER TABLE `user_power` CHANGE `expires` `expires` datetime NULL");
        await queryRunner.query("ALTER TABLE `user` CHANGE `lastUpdate` `lastUpdate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP");
        await queryRunner.query("ALTER TABLE `vip` CHANGE `start` `start` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP");
        await queryRunner.query("ALTER TABLE `vip` CHANGE `last` `last` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP");
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `vip` CHANGE `last` `last` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP");
        await queryRunner.query("ALTER TABLE `vip` CHANGE `start` `start` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP");
        await queryRunner.query("ALTER TABLE `user` CHANGE `lastUpdate` `lastUpdate` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP");
        await queryRunner.query("ALTER TABLE `user_power` CHANGE `expires` `expires` datetime(0) NULL");
        await queryRunner.query("ALTER TABLE `coupon` CHANGE `expires` `expires` datetime(0) NOT NULL");
        await queryRunner.query("ALTER TABLE `stream_queue` CHANGE `start` `start` datetime(0) NULL");
        await queryRunner.query("ALTER TABLE `user` ADD `email` varchar(255) NOT NULL");
    }

}
