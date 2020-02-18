import { MigrationInterface, QueryRunner } from 'typeorm';

export class Coupon1581762679971 implements MigrationInterface {
    public name = 'Coupon1581762679971';

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            'CREATE TABLE `coupon` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, `amount` int NOT NULL, `max` int NOT NULL, `expires` datetime NOT NULL, UNIQUE INDEX `IDX_0ecadaa094a214e25334625f69` (`name`), PRIMARY KEY (`id`)) ENGINE=InnoDB',
            undefined
        );
        await queryRunner.query(
            'CREATE TABLE `user_coupons_coupon` (`userId` int NOT NULL, `couponId` int NOT NULL, INDEX `IDX_46c2e63b286657272a29c74498` (`userId`), INDEX `IDX_11f87fdb0c2f2d04979eafb81c` (`couponId`), PRIMARY KEY (`userId`, `couponId`)) ENGINE=InnoDB',
            undefined
        );
        await queryRunner.query(
            'ALTER TABLE `stream_queue` CHANGE `start` `start` datetime NULL DEFAULT null',
            undefined
        );
        await queryRunner.query(
            'ALTER TABLE `user_coupons_coupon` ADD CONSTRAINT `FK_46c2e63b286657272a29c744981` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
            undefined
        );
        await queryRunner.query(
            'ALTER TABLE `user_coupons_coupon` ADD CONSTRAINT `FK_11f87fdb0c2f2d04979eafb81c1` FOREIGN KEY (`couponId`) REFERENCES `coupon`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
            undefined
        );
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            'ALTER TABLE `user_coupons_coupon` DROP FOREIGN KEY `FK_11f87fdb0c2f2d04979eafb81c1`',
            undefined
        );
        await queryRunner.query(
            'ALTER TABLE `user_coupons_coupon` DROP FOREIGN KEY `FK_46c2e63b286657272a29c744981`',
            undefined
        );
        await queryRunner.query('ALTER TABLE `stream_queue` CHANGE `start` `start` datetime NULL', undefined);
        await queryRunner.query('DROP INDEX `IDX_11f87fdb0c2f2d04979eafb81c` ON `user_coupons_coupon`', undefined);
        await queryRunner.query('DROP INDEX `IDX_46c2e63b286657272a29c74498` ON `user_coupons_coupon`', undefined);
        await queryRunner.query('DROP TABLE `user_coupons_coupon`', undefined);
        await queryRunner.query('DROP INDEX `IDX_0ecadaa094a214e25334625f69` ON `coupon`', undefined);
        await queryRunner.query('DROP TABLE `coupon`', undefined);
    }
}
