import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserKeys1591946170407 implements MigrationInterface {
    public name = 'UserKeys1591946170407';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `steam_key` ADD `userId` int NULL', undefined);
        await queryRunner.query(
            'ALTER TABLE `steam_key` ADD CONSTRAINT `FK_c2c42eea8937b7c66723f5c39dc` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
            undefined
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `steam_key` DROP FOREIGN KEY `FK_c2c42eea8937b7c66723f5c39dc`', undefined);
        await queryRunner.query('ALTER TABLE `steam_key` DROP COLUMN `userId`', undefined);
    }
}
