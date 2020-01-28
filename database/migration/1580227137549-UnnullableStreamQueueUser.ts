import {MigrationInterface, QueryRunner} from "typeorm";

export class UnnullableStreamQueueUser1580227137549 implements MigrationInterface {
    name = 'UnnullableStreamQueueUser1580227137549'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `user_power` CHANGE `expires` `expires` datetime NULL DEFAULT null", undefined);
        await queryRunner.query("ALTER TABLE `stream_queue` DROP FOREIGN KEY `FK_4c57791f489aeae47721e7885c2`", undefined);
        await queryRunner.query("ALTER TABLE `stream_queue` CHANGE `start` `start` datetime NULL DEFAULT null", undefined);
        await queryRunner.query("ALTER TABLE `stream_queue` CHANGE `userId` `userId` int NOT NULL", undefined);
        await queryRunner.query("ALTER TABLE `stream_queue` ADD CONSTRAINT `FK_4c57791f489aeae47721e7885c2` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `stream_queue` DROP FOREIGN KEY `FK_4c57791f489aeae47721e7885c2`", undefined);
        await queryRunner.query("ALTER TABLE `stream_queue` CHANGE `userId` `userId` int NULL", undefined);
        await queryRunner.query("ALTER TABLE `stream_queue` CHANGE `start` `start` datetime NULL", undefined);
        await queryRunner.query("ALTER TABLE `stream_queue` ADD CONSTRAINT `FK_4c57791f489aeae47721e7885c2` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `user_power` CHANGE `expires` `expires` datetime NULL", undefined);
    }

}
