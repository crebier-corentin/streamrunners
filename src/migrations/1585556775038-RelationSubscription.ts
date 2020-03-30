import { MigrationInterface, QueryRunner } from 'typeorm';

export class RelationSubscription1585556775038 implements MigrationInterface {
    public name = 'RelationSubscription1585556775038';

    public async up(queryRunner: QueryRunner): Promise<any> {
        const currentSubs = await queryRunner.query('SELECT `id`,`userId` FROM `subscription` WHERE `current` = TRUE');

        await queryRunner.query('ALTER TABLE `subscription` DROP COLUMN `current`', undefined);
        await queryRunner.query('ALTER TABLE `subscription` ADD `details` json NOT NULL AFTER `paypalId`', undefined);
        await queryRunner.query(
            "ALTER TABLE `subscription` ADD `lastDetailsUpdate` datetime NOT NULL DEFAULT '1970-01-01 00:00:00' AFTER `details`",
            undefined
        );
        await queryRunner.query('ALTER TABLE `subscription` ADD `currentUserId` int NULL', undefined);
        await queryRunner.query(
            'ALTER TABLE `subscription` ADD UNIQUE INDEX `IDX_92a697d545434cbe7a74ec7f2b` (`currentUserId`)',
            undefined
        );
        await queryRunner.query(
            'ALTER TABLE `subscription` ADD UNIQUE INDEX `IDX_e7bfd0fea8fae5ced72b0d7666` (`paypalId`)',
            undefined
        );
        await queryRunner.query(
            'CREATE UNIQUE INDEX `REL_92a697d545434cbe7a74ec7f2b` ON `subscription` (`currentUserId`)',
            undefined
        );
        await queryRunner.query(
            'ALTER TABLE `subscription` ADD CONSTRAINT `FK_92a697d545434cbe7a74ec7f2bb` FOREIGN KEY (`currentUserId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
            undefined
        );

        for (const { id, userId } of currentSubs) {
            await queryRunner.query('UPDATE `subscription` SET `currentUserId` = ? WHERE `id` = ?', [userId, id]);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        const currentSubs = await queryRunner.query(
            'SELECT `id` FROM `subscription` WHERE `currentUserId` IS NOT NULL'
        );

        await queryRunner.query(
            'ALTER TABLE `subscription` DROP FOREIGN KEY `FK_92a697d545434cbe7a74ec7f2bb`',
            undefined
        );
        await queryRunner.query('DROP INDEX `REL_92a697d545434cbe7a74ec7f2b` ON `subscription`', undefined);
        await queryRunner.query('ALTER TABLE `subscription` DROP INDEX `IDX_e7bfd0fea8fae5ced72b0d7666`', undefined);
        await queryRunner.query('ALTER TABLE `subscription` DROP INDEX `IDX_92a697d545434cbe7a74ec7f2b`', undefined);
        await queryRunner.query('ALTER TABLE `subscription` DROP COLUMN `currentUserId`', undefined);
        await queryRunner.query('ALTER TABLE `subscription` DROP COLUMN `details`', undefined);
        await queryRunner.query('ALTER TABLE `subscription` DROP COLUMN `lastDetailsUpdate`', undefined);
        await queryRunner.query("ALTER TABLE `subscription` ADD `current` tinyint NOT NULL DEFAULT '0'", undefined);

        for (const { id } of currentSubs) {
            await queryRunner.query('UPDATE `subscription` SET `current` = TRUE WHERE `id` = ?', [id]);
        }
    }
}
