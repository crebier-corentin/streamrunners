import { MigrationInterface, QueryRunner } from 'typeorm';

export class Case1586184471446 implements MigrationInterface {
    public name = 'Case1586184471446';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP INDEX `IDX_92a697d545434cbe7a74ec7f2b` ON `subscription`', undefined);
        await queryRunner.query(
            'CREATE TABLE `case_type` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, `openImage` varchar(255) NULL, `closeImage` varchar(255) NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX `IDX_cc448600b50a597a56b58b5b51` (`name`), PRIMARY KEY (`id`)) ENGINE=InnoDB',
            undefined
        );
        await queryRunner.query(
            'CREATE TABLE `case_content` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, `image` varchar(255) NULL, `chance` int NOT NULL, `amount` int NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `caseTypeId` int NOT NULL, UNIQUE INDEX `IDX_3ca7b65f7b821a3e768083ff0a` (`name`), PRIMARY KEY (`id`)) ENGINE=InnoDB',
            undefined
        );
        await queryRunner.query(
            'CREATE TABLE `case` (`id` int NOT NULL AUTO_INCREMENT, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `userId` int NOT NULL, `typeId` int NOT NULL, `contentId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB',
            undefined
        );
        await queryRunner.query(
            'ALTER TABLE `case_content` ADD CONSTRAINT `FK_4e24907dbfcb0d7aef98384b8c5` FOREIGN KEY (`caseTypeId`) REFERENCES `case_type`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
            undefined
        );
        await queryRunner.query(
            'ALTER TABLE `case` ADD CONSTRAINT `FK_82d729c0bc510cc12a51b48bd6e` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
            undefined
        );
        await queryRunner.query(
            'ALTER TABLE `case` ADD CONSTRAINT `FK_60caacee8b711ed2add8d8e1f31` FOREIGN KEY (`typeId`) REFERENCES `case_type`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
            undefined
        );
        await queryRunner.query(
            'ALTER TABLE `case` ADD CONSTRAINT `FK_720f91c6badbf08ab7d3200bde1` FOREIGN KEY (`contentId`) REFERENCES `case_content`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
            undefined
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `case` DROP FOREIGN KEY `FK_720f91c6badbf08ab7d3200bde1`', undefined);
        await queryRunner.query('ALTER TABLE `case` DROP FOREIGN KEY `FK_60caacee8b711ed2add8d8e1f31`', undefined);
        await queryRunner.query('ALTER TABLE `case` DROP FOREIGN KEY `FK_82d729c0bc510cc12a51b48bd6e`', undefined);
        await queryRunner.query(
            'ALTER TABLE `case_content` DROP FOREIGN KEY `FK_4e24907dbfcb0d7aef98384b8c5`',
            undefined
        );
        await queryRunner.query('DROP TABLE `case`', undefined);
        await queryRunner.query('DROP INDEX `IDX_3ca7b65f7b821a3e768083ff0a` ON `case_content`', undefined);
        await queryRunner.query('DROP TABLE `case_content`', undefined);
        await queryRunner.query('DROP INDEX `IDX_cc448600b50a597a56b58b5b51` ON `case_type`', undefined);
        await queryRunner.query('DROP TABLE `case_type`', undefined);
        await queryRunner.query(
            'CREATE UNIQUE INDEX `IDX_92a697d545434cbe7a74ec7f2b` ON `subscription` (`currentUserId`)',
            undefined
        );
    }
}
