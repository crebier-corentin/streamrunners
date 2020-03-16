import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserTwitchDescriptionText1584367586822 implements MigrationInterface {
    public name = 'UserTwitchDescriptionText1584367586822';

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query('ALTER TABLE `user` MODIFY `twitchDescription` TEXT NOT NULL AFTER `avatar`');
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query('ALTER TABLE `user` MODIFY `twitchDescription` varchar(255) NOT NULL');
    }
}
