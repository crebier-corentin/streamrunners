import {MigrationInterface, QueryRunner} from "typeorm";

export class DiscordBot1578321534345 implements MigrationInterface {
    name = 'DiscordBot1578321534345'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `stream_queue` DROP FOREIGN KEY `FK_4c57791f489aeae47721e7885c2`", undefined);
        await queryRunner.query("ALTER TABLE `steam_key` DROP FOREIGN KEY `FK_cb0322781cf51277cf61a1f3fad`", undefined);
        await queryRunner.query("ALTER TABLE `case_owned` DROP FOREIGN KEY `FK_b99ebb50844eaafec7389b2f785`", undefined);
        await queryRunner.query("ALTER TABLE `case_owned` DROP FOREIGN KEY `FK_d56468c5027443510ae8b899560`", undefined);
        await queryRunner.query("ALTER TABLE `case_owned` DROP FOREIGN KEY `FK_eb1edce6f3bb8dda0df6b52916b`", undefined);
        await queryRunner.query("ALTER TABLE `user_power` DROP FOREIGN KEY `FK_2020cfc98924d29b236fb5de540`", undefined);
        await queryRunner.query("ALTER TABLE `transaction` DROP FOREIGN KEY `FK_605baeb040ff0fae995404cea37`", undefined);
        await queryRunner.query("ALTER TABLE `case_content` DROP FOREIGN KEY `FK_95dc435cda5d1954980c4cb72b9`", undefined);
        await queryRunner.query("ALTER TABLE `vip` DROP FOREIGN KEY `FK_644dc2330f256cff0d683b2f495`", undefined);
        await queryRunner.query("ALTER TABLE `user_coupons_coupon` DROP FOREIGN KEY `FK_11f87fdb0c2f2d04979eafb81c1`", undefined);
        await queryRunner.query("ALTER TABLE `user_coupons_coupon` DROP FOREIGN KEY `FK_46c2e63b286657272a29c744981`", undefined);
        await queryRunner.query("CREATE TABLE `discord_user` (`id` int NOT NULL AUTO_INCREMENT, `discordId` varchar(255) NOT NULL, `xp` int NOT NULL DEFAULT 0, `level` int NOT NULL DEFAULT 0, PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
        await queryRunner.query("ALTER TABLE `stream_queue` CHANGE `start` `start` datetime NULL DEFAULT null", undefined);
        await queryRunner.query("ALTER TABLE `user_power` CHANGE `expires` `expires` datetime NULL DEFAULT null", undefined);
        await queryRunner.query("CREATE INDEX `IDX_46c2e63b286657272a29c74498` ON `user_coupons_coupon` (`userId`)", undefined);
        await queryRunner.query("CREATE INDEX `IDX_11f87fdb0c2f2d04979eafb81c` ON `user_coupons_coupon` (`couponId`)", undefined);
        await queryRunner.query("ALTER TABLE `stream_queue` ADD CONSTRAINT `FK_4c57791f489aeae47721e7885c2` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `steam_key` ADD CONSTRAINT `FK_cb0322781cf51277cf61a1f3fad` FOREIGN KEY (`caseOwnedId`) REFERENCES `case_owned`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `case_owned` ADD CONSTRAINT `FK_eb1edce6f3bb8dda0df6b52916b` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `case_owned` ADD CONSTRAINT `FK_d56468c5027443510ae8b899560` FOREIGN KEY (`caseId`) REFERENCES `case`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `case_owned` ADD CONSTRAINT `FK_b99ebb50844eaafec7389b2f785` FOREIGN KEY (`contentId`) REFERENCES `case_content`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `user_power` ADD CONSTRAINT `FK_2020cfc98924d29b236fb5de540` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `transaction` ADD CONSTRAINT `FK_605baeb040ff0fae995404cea37` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `case_content` ADD CONSTRAINT `FK_95dc435cda5d1954980c4cb72b9` FOREIGN KEY (`caseId`) REFERENCES `case`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `vip` ADD CONSTRAINT `FK_644dc2330f256cff0d683b2f495` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `user_coupons_coupon` ADD CONSTRAINT `FK_46c2e63b286657272a29c744981` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `user_coupons_coupon` ADD CONSTRAINT `FK_11f87fdb0c2f2d04979eafb81c1` FOREIGN KEY (`couponId`) REFERENCES `coupon`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `user_coupons_coupon` DROP FOREIGN KEY `FK_11f87fdb0c2f2d04979eafb81c1`", undefined);
        await queryRunner.query("ALTER TABLE `user_coupons_coupon` DROP FOREIGN KEY `FK_46c2e63b286657272a29c744981`", undefined);
        await queryRunner.query("ALTER TABLE `vip` DROP FOREIGN KEY `FK_644dc2330f256cff0d683b2f495`", undefined);
        await queryRunner.query("ALTER TABLE `case_content` DROP FOREIGN KEY `FK_95dc435cda5d1954980c4cb72b9`", undefined);
        await queryRunner.query("ALTER TABLE `transaction` DROP FOREIGN KEY `FK_605baeb040ff0fae995404cea37`", undefined);
        await queryRunner.query("ALTER TABLE `user_power` DROP FOREIGN KEY `FK_2020cfc98924d29b236fb5de540`", undefined);
        await queryRunner.query("ALTER TABLE `case_owned` DROP FOREIGN KEY `FK_b99ebb50844eaafec7389b2f785`", undefined);
        await queryRunner.query("ALTER TABLE `case_owned` DROP FOREIGN KEY `FK_d56468c5027443510ae8b899560`", undefined);
        await queryRunner.query("ALTER TABLE `case_owned` DROP FOREIGN KEY `FK_eb1edce6f3bb8dda0df6b52916b`", undefined);
        await queryRunner.query("ALTER TABLE `steam_key` DROP FOREIGN KEY `FK_cb0322781cf51277cf61a1f3fad`", undefined);
        await queryRunner.query("ALTER TABLE `stream_queue` DROP FOREIGN KEY `FK_4c57791f489aeae47721e7885c2`", undefined);
        await queryRunner.query("DROP INDEX `IDX_11f87fdb0c2f2d04979eafb81c` ON `user_coupons_coupon`", undefined);
        await queryRunner.query("DROP INDEX `IDX_46c2e63b286657272a29c74498` ON `user_coupons_coupon`", undefined);
        await queryRunner.query("ALTER TABLE `user_power` CHANGE `expires` `expires` datetime NULL", undefined);
        await queryRunner.query("ALTER TABLE `stream_queue` CHANGE `start` `start` datetime NULL", undefined);
        await queryRunner.query("DROP TABLE `discord_user`", undefined);
        await queryRunner.query("ALTER TABLE `user_coupons_coupon` ADD CONSTRAINT `FK_46c2e63b286657272a29c744981` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT", undefined);
        await queryRunner.query("ALTER TABLE `user_coupons_coupon` ADD CONSTRAINT `FK_11f87fdb0c2f2d04979eafb81c1` FOREIGN KEY (`couponId`) REFERENCES `coupon`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT", undefined);
        await queryRunner.query("ALTER TABLE `vip` ADD CONSTRAINT `FK_644dc2330f256cff0d683b2f495` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT", undefined);
        await queryRunner.query("ALTER TABLE `case_content` ADD CONSTRAINT `FK_95dc435cda5d1954980c4cb72b9` FOREIGN KEY (`caseId`) REFERENCES `case`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT", undefined);
        await queryRunner.query("ALTER TABLE `transaction` ADD CONSTRAINT `FK_605baeb040ff0fae995404cea37` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT", undefined);
        await queryRunner.query("ALTER TABLE `user_power` ADD CONSTRAINT `FK_2020cfc98924d29b236fb5de540` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT", undefined);
        await queryRunner.query("ALTER TABLE `case_owned` ADD CONSTRAINT `FK_eb1edce6f3bb8dda0df6b52916b` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT", undefined);
        await queryRunner.query("ALTER TABLE `case_owned` ADD CONSTRAINT `FK_d56468c5027443510ae8b899560` FOREIGN KEY (`caseId`) REFERENCES `case`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT", undefined);
        await queryRunner.query("ALTER TABLE `case_owned` ADD CONSTRAINT `FK_b99ebb50844eaafec7389b2f785` FOREIGN KEY (`contentId`) REFERENCES `case_content`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT", undefined);
        await queryRunner.query("ALTER TABLE `steam_key` ADD CONSTRAINT `FK_cb0322781cf51277cf61a1f3fad` FOREIGN KEY (`caseOwnedId`) REFERENCES `case_owned`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT", undefined);
        await queryRunner.query("ALTER TABLE `stream_queue` ADD CONSTRAINT `FK_4c57791f489aeae47721e7885c2` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT", undefined);
    }

}
