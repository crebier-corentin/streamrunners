import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveUserLastUpdate1586011298077 implements MigrationInterface {
    public name = 'RemoveUserLastUpdate1586011298077';

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query('ALTER TABLE `user` DROP COLUMN `lastUpdate`', undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            'ALTER TABLE `user` ADD `lastUpdate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP',
            undefined
        );
    }
}
