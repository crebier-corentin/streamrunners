import {MigrationInterface, QueryRunner} from "typeorm";

export class BaseMigration1535611208297 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("CREATE TABLE `stream_queue` (`id` int NOT NULL AUTO_INCREMENT, `amount` int NOT NULL DEFAULT 100, `time` int NOT NULL DEFAULT 60, `current` int NOT NULL DEFAULT 0, `start` datetime NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `userId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `stream_session` (`id` int NOT NULL AUTO_INCREMENT, `amount` int NOT NULL DEFAULT 100, `start` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, `last` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, `ended` tinyint NOT NULL DEFAULT 0, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `userId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `watch_session` (`id` int NOT NULL AUTO_INCREMENT, `start` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, `last` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, `userId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `user` (`id` int NOT NULL AUTO_INCREMENT, `twitchId` varchar(255) NOT NULL, `username` varchar(255) NOT NULL, `display_name` varchar(255) NOT NULL, `email` varchar(255) NOT NULL, `avatar` varchar(255) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `manual_points` (`id` int NOT NULL AUTO_INCREMENT, `amount` int NOT NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `userId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `stream_queue` ADD CONSTRAINT `FK_4c57791f489aeae47721e7885c2` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE");
        await queryRunner.query("ALTER TABLE `stream_session` ADD CONSTRAINT `FK_5d859efcfd20003f8d8447c875a` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE");
        await queryRunner.query("ALTER TABLE `watch_session` ADD CONSTRAINT `FK_661824d1af2805b7846382d6270` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE");
        await queryRunner.query("ALTER TABLE `manual_points` ADD CONSTRAINT `FK_20ad463604853de5518010becbc` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE");
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `manual_points` DROP FOREIGN KEY `FK_20ad463604853de5518010becbc`");
        await queryRunner.query("ALTER TABLE `watch_session` DROP FOREIGN KEY `FK_661824d1af2805b7846382d6270`");
        await queryRunner.query("ALTER TABLE `stream_session` DROP FOREIGN KEY `FK_5d859efcfd20003f8d8447c875a`");
        await queryRunner.query("ALTER TABLE `stream_queue` DROP FOREIGN KEY `FK_4c57791f489aeae47721e7885c2`");
        await queryRunner.query("DROP TABLE `manual_points`");
        await queryRunner.query("DROP TABLE `user`");
        await queryRunner.query("DROP TABLE `watch_session`");
        await queryRunner.query("DROP TABLE `stream_session`");
        await queryRunner.query("DROP TABLE `stream_queue`");
    }

}
