import { MigrationInterface, QueryRunner } from 'typeorm';

export class User1581243314703 implements MigrationInterface {
    name = 'User1581243314703';

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            'CREATE TABLE `user` (`id` int NOT NULL AUTO_INCREMENT, `twitchId` varchar(255) NOT NULL, `username` varchar(255) NOT NULL, `displayName` varchar(255) NOT NULL, `avatar` varchar(255) NOT NULL, `points` int NOT NULL DEFAULT 0, `moderator` tinyint NOT NULL DEFAULT 0, `lastUpdate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, `lastOnWatchPage` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, `chatRank` int NOT NULL DEFAULT 0, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (`id`)) ENGINE=InnoDB',
            undefined
        );
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query('DROP TABLE `user`', undefined);
    }
}
