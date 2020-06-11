import { MigrationInterface, QueryRunner } from 'typeorm';

export class SteamKeyCategory1591787759157 implements MigrationInterface {
    public name = 'SteamKeyCategory1591787759157';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const keys = await queryRunner.query('SELECT id, category FROM steam_key');
        const contents = await queryRunner.query(
            'SELECT id, keyCategory FROM case_content WHERE keyCategory IS NOT NULL'
        );
        const categories = new Set<string>(keys.map(k => k.category));

        await queryRunner.query(
            'CREATE TABLE `steam_key_category` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, `buyable` tinyint NOT NULL DEFAULT 0, `cost` int UNSIGNED NOT NULL DEFAULT 0, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX `IDX_4f9f452ad862a2bf16a2c011aa` (`name`), PRIMARY KEY (`id`)) ENGINE=InnoDB',
            undefined
        );

        await queryRunner.query('ALTER TABLE `steam_key` DROP COLUMN `category`', undefined);
        await queryRunner.query('ALTER TABLE `steam_key` ADD `categoryId` int NULL', undefined);

        await queryRunner.query('ALTER TABLE `case_content` DROP COLUMN `keyCategory`', undefined);
        await queryRunner.query('ALTER TABLE `case_content` ADD `keyCategoryId` int NULL', undefined);

        await queryRunner.query(
            'ALTER TABLE `steam_key` ADD CONSTRAINT `FK_7f52f0e80be66791f98e3bbca83` FOREIGN KEY (categoryId) REFERENCES `steam_key_category`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
            undefined
        );
        await queryRunner.query(
            'ALTER TABLE `case_content` ADD CONSTRAINT `FK_919054a195b527a2cb646e1cc23` FOREIGN KEY (keyCategoryId) REFERENCES `steam_key_category`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
            undefined
        );

        //Create steam key categories
        const categoriesIds = {};
        for (const category of categories) {
            await queryRunner.query('INSERT INTO steam_key_category (name) VALUES (?)', [category]);
            const { id } = (await queryRunner.query('SELECT id FROM steam_key_category WHERE name = ?', [category]))[0];

            categoriesIds[category] = id;
        }

        //Set relations
        for (const key of keys) {
            await queryRunner.query('UPDATE steam_key SET categoryId = ? WHERE id = ?', [
                categoriesIds[key.category],
                key.id,
            ]);
        }

        for (const content of contents) {
            await queryRunner.query('UPDATE case_content SET keyCategoryId = ? WHERE id = ?', [
                categoriesIds[content.keyCategory],
                content.id,
            ]);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const keys = await queryRunner.query('SELECT id, categoryId FROM steam_key');
        const contents = await queryRunner.query(
            'SELECT id, keyCategoryId FROM case_content WHERE keyCategoryId IS NOT NULL'
        );
        const categories = new Set<number>(keys.map(k => k.categoryId));

        const categoriesNames = {};
        for (const category of categories) {
            const { name } = (
                await queryRunner.query('SELECT name FROM steam_key_category WHERE id = ?', [category])
            )[0];

            categoriesNames[category] = name;
        }

        await queryRunner.query(
            'ALTER TABLE `case_content` DROP FOREIGN KEY `FK_919054a195b527a2cb646e1cc23`',
            undefined
        );
        await queryRunner.query('ALTER TABLE `steam_key` DROP FOREIGN KEY `FK_7f52f0e80be66791f98e3bbca83`', undefined);

        await queryRunner.query('ALTER TABLE `case_content` DROP COLUMN keyCategoryId', undefined);
        await queryRunner.query('ALTER TABLE `steam_key` DROP COLUMN categoryId', undefined);

        await queryRunner.query('DROP INDEX `IDX_4f9f452ad862a2bf16a2c011aa` ON `steam_key_category`', undefined);
        await queryRunner.query('DROP TABLE `steam_key_category`', undefined);

        await queryRunner.query('ALTER TABLE `case_content` ADD `keyCategory` varchar(255) NULL', undefined);
        await queryRunner.query(
            "ALTER TABLE `steam_key` ADD `category` varchar(255) NOT NULL DEFAULT 'random'",
            undefined
        );

        //Set categories
        for (const key of keys) {
            await queryRunner.query('UPDATE steam_key SET category = ? WHERE id = ?', [
                categoriesNames[key.categoryId],
                key.id,
            ]);
        }

        for (const content of contents) {
            await queryRunner.query('UPDATE case_content SET keyCategory = ? WHERE id = ?', [
                categoriesNames[content.keyCategoryId],
                content.id,
            ]);
        }
    }
}
