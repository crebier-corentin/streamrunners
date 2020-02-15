import { MigrationInterface, QueryRunner } from 'typeorm';

export class Raffle1581777385935 implements MigrationInterface {
    name = 'Raffle1581777385935';

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            "CREATE TABLE `raffle` (`id` int NOT NULL AUTO_INCREMENT, `title` varchar(255) NOT NULL, `description` varchar(255) NOT NULL DEFAULT '', `icon` varchar(255) NOT NULL, `price` int NOT NULL, `maxTickets` int NOT NULL DEFAULT -1, `endingDate` datetime NOT NULL, `code` varchar(255) NULL, `value` int NOT NULL DEFAULT 0, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `winnerId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB",
            undefined
        );
        await queryRunner.query(
            'CREATE TABLE `raffle_participation` (`id` int NOT NULL AUTO_INCREMENT, `tickets` int NOT NULL DEFAULT 0, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `userId` int NULL, `raffleId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB',
            undefined
        );
        await queryRunner.query(
            'ALTER TABLE `stream_queue` CHANGE `start` `start` datetime NULL DEFAULT null',
            undefined
        );
        await queryRunner.query(
            'ALTER TABLE `raffle` ADD CONSTRAINT `FK_653451244fd633e61fe5419014f` FOREIGN KEY (`winnerId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
            undefined
        );
        await queryRunner.query(
            'ALTER TABLE `raffle_participation` ADD CONSTRAINT `FK_eb8aff0a28359ad6382b803cb36` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
            undefined
        );
        await queryRunner.query(
            'ALTER TABLE `raffle_participation` ADD CONSTRAINT `FK_43642d91b252599be34654784b6` FOREIGN KEY (`raffleId`) REFERENCES `raffle`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
            undefined
        );
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            'ALTER TABLE `raffle_participation` DROP FOREIGN KEY `FK_43642d91b252599be34654784b6`',
            undefined
        );
        await queryRunner.query(
            'ALTER TABLE `raffle_participation` DROP FOREIGN KEY `FK_eb8aff0a28359ad6382b803cb36`',
            undefined
        );
        await queryRunner.query('ALTER TABLE `raffle` DROP FOREIGN KEY `FK_653451244fd633e61fe5419014f`', undefined);
        await queryRunner.query('ALTER TABLE `stream_queue` CHANGE `start` `start` datetime NULL', undefined);
        await queryRunner.query('DROP TABLE `raffle_participation`', undefined);
        await queryRunner.query('DROP TABLE `raffle`', undefined);
    }
}
