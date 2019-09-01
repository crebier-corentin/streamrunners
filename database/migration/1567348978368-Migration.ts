import {MigrationInterface, QueryRunner} from "typeorm";

export class Migration1567348978368 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("CREATE TABLE `coupon` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, `amount` int NOT NULL, `max` int NOT NULL, `expires` datetime NOT NULL, UNIQUE INDEX `IDX_0ecadaa094a214e25334625f69` (`name`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `steam_key` (`id` int NOT NULL AUTO_INCREMENT, `key` varchar(255) NOT NULL, `game` varchar(255) NOT NULL, `caseOwnedId` int NULL, UNIQUE INDEX `IDX_f53a58c54c13917af798c1dc5e` (`key`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `case_owned` (`id` int NOT NULL AUTO_INCREMENT, `uuid` varchar(255) NOT NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `userId` int NULL, `caseId` int NULL, `contentId` int NULL, UNIQUE INDEX `IDX_1145f6962c79bc75006ab536cc` (`uuid`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `user_power` (`id` int NOT NULL AUTO_INCREMENT, `powerName` varchar(255) NOT NULL, `used` tinyint NOT NULL DEFAULT 0, `expires` datetime NULL, `userId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `transaction` (`id` int NOT NULL AUTO_INCREMENT, `status` varchar(255) NOT NULL, `amount` varchar(255) NOT NULL, `paymentInstrumentType` varchar(255) NOT NULL, `paypalId` varchar(255) NOT NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `userId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `case_content` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, `image` varchar(255) NULL, `amount` int NULL, `chance` int NOT NULL, `special` varchar(255) NULL, `caseId` int NULL, UNIQUE INDEX `IDX_3ca7b65f7b821a3e768083ff0a` (`name`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `case` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, `openImage` varchar(255) NULL, `closeImage` varchar(255) NULL, UNIQUE INDEX `IDX_41867765e5643f1f391ab30a7e` (`name`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `product` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, `displayName` varchar(255) NOT NULL, `description` varchar(255) NOT NULL, `amount` varchar(255) NOT NULL, `image` varchar(255) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `vip` (`id` int NOT NULL AUTO_INCREMENT, `start` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, `last` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, `userId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `user_coupons_coupon` (`userId` int NOT NULL, `couponId` int NOT NULL, PRIMARY KEY (`userId`, `couponId`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `user` ADD `points` int NOT NULL DEFAULT 0");
        await queryRunner.query("ALTER TABLE `user` ADD `moderator` tinyint NOT NULL DEFAULT 0");
        await queryRunner.query("ALTER TABLE `user` ADD `lastUpdate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP");
        await queryRunner.query("ALTER TABLE `user` ADD `betaBage` tinyint NOT NULL DEFAULT 0");
        await queryRunner.query("ALTER TABLE `stream_queue` CHANGE `start` `start` datetime NULL");
        await queryRunner.query("ALTER TABLE `steam_key` ADD CONSTRAINT `FK_cb0322781cf51277cf61a1f3fad` FOREIGN KEY (`caseOwnedId`) REFERENCES `case_owned`(`id`)");
        await queryRunner.query("ALTER TABLE `case_owned` ADD CONSTRAINT `FK_eb1edce6f3bb8dda0df6b52916b` FOREIGN KEY (`userId`) REFERENCES `user`(`id`)");
        await queryRunner.query("ALTER TABLE `case_owned` ADD CONSTRAINT `FK_d56468c5027443510ae8b899560` FOREIGN KEY (`caseId`) REFERENCES `case`(`id`)");
        await queryRunner.query("ALTER TABLE `case_owned` ADD CONSTRAINT `FK_b99ebb50844eaafec7389b2f785` FOREIGN KEY (`contentId`) REFERENCES `case_content`(`id`)");
        await queryRunner.query("ALTER TABLE `user_power` ADD CONSTRAINT `FK_2020cfc98924d29b236fb5de540` FOREIGN KEY (`userId`) REFERENCES `user`(`id`)");
        await queryRunner.query("ALTER TABLE `transaction` ADD CONSTRAINT `FK_605baeb040ff0fae995404cea37` FOREIGN KEY (`userId`) REFERENCES `user`(`id`)");
        await queryRunner.query("ALTER TABLE `case_content` ADD CONSTRAINT `FK_95dc435cda5d1954980c4cb72b9` FOREIGN KEY (`caseId`) REFERENCES `case`(`id`)");
        await queryRunner.query("ALTER TABLE `vip` ADD CONSTRAINT `FK_644dc2330f256cff0d683b2f495` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE");
        await queryRunner.query("ALTER TABLE `user_coupons_coupon` ADD CONSTRAINT `FK_46c2e63b286657272a29c744981` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE");
        await queryRunner.query("ALTER TABLE `user_coupons_coupon` ADD CONSTRAINT `FK_11f87fdb0c2f2d04979eafb81c1` FOREIGN KEY (`couponId`) REFERENCES `coupon`(`id`) ON DELETE CASCADE");
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `user_coupons_coupon` DROP FOREIGN KEY `FK_11f87fdb0c2f2d04979eafb81c1`");
        await queryRunner.query("ALTER TABLE `user_coupons_coupon` DROP FOREIGN KEY `FK_46c2e63b286657272a29c744981`");
        await queryRunner.query("ALTER TABLE `vip` DROP FOREIGN KEY `FK_644dc2330f256cff0d683b2f495`");
        await queryRunner.query("ALTER TABLE `case_content` DROP FOREIGN KEY `FK_95dc435cda5d1954980c4cb72b9`");
        await queryRunner.query("ALTER TABLE `transaction` DROP FOREIGN KEY `FK_605baeb040ff0fae995404cea37`");
        await queryRunner.query("ALTER TABLE `user_power` DROP FOREIGN KEY `FK_2020cfc98924d29b236fb5de540`");
        await queryRunner.query("ALTER TABLE `case_owned` DROP FOREIGN KEY `FK_b99ebb50844eaafec7389b2f785`");
        await queryRunner.query("ALTER TABLE `case_owned` DROP FOREIGN KEY `FK_d56468c5027443510ae8b899560`");
        await queryRunner.query("ALTER TABLE `case_owned` DROP FOREIGN KEY `FK_eb1edce6f3bb8dda0df6b52916b`");
        await queryRunner.query("ALTER TABLE `steam_key` DROP FOREIGN KEY `FK_cb0322781cf51277cf61a1f3fad`");
        await queryRunner.query("ALTER TABLE `stream_queue` CHANGE `start` `start` datetime(0) NULL");
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `betaBage`");
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `lastUpdate`");
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `moderator`");
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `points`");
        await queryRunner.query("DROP TABLE `user_coupons_coupon`");
        await queryRunner.query("DROP TABLE `vip`");
        await queryRunner.query("DROP TABLE `product`");
        await queryRunner.query("DROP INDEX `IDX_41867765e5643f1f391ab30a7e` ON `case`");
        await queryRunner.query("DROP TABLE `case`");
        await queryRunner.query("DROP INDEX `IDX_3ca7b65f7b821a3e768083ff0a` ON `case_content`");
        await queryRunner.query("DROP TABLE `case_content`");
        await queryRunner.query("DROP TABLE `transaction`");
        await queryRunner.query("DROP TABLE `user_power`");
        await queryRunner.query("DROP INDEX `IDX_1145f6962c79bc75006ab536cc` ON `case_owned`");
        await queryRunner.query("DROP TABLE `case_owned`");
        await queryRunner.query("DROP INDEX `IDX_f53a58c54c13917af798c1dc5e` ON `steam_key`");
        await queryRunner.query("DROP TABLE `steam_key`");
        await queryRunner.query("DROP INDEX `IDX_0ecadaa094a214e25334625f69` ON `coupon`");
        await queryRunner.query("DROP TABLE `coupon`");
    }

}
