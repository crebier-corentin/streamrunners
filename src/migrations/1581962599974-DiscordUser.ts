import { MigrationInterface, QueryRunner } from 'typeorm';

export class DiscordUser1581962599974 implements MigrationInterface {
    name = 'DiscordUser1581962599974';

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            'CREATE TABLE `discord_user` (`id` int NOT NULL AUTO_INCREMENT, `discordId` varchar(255) NOT NULL, `xp` int NOT NULL DEFAULT 0, `level` int NOT NULL DEFAULT 0, PRIMARY KEY (`id`)) ENGINE=InnoDB',
            undefined
        );
        await queryRunner.query(
            'ALTER TABLE `stream_queue` CHANGE `start` `start` datetime NULL DEFAULT null',
            undefined
        );
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query('ALTER TABLE `stream_queue` CHANGE `start` `start` datetime NULL', undefined);
        await queryRunner.query('DROP TABLE `discord_user`', undefined);
    }
}
