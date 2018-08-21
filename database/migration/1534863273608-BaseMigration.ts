import {MigrationInterface, QueryRunner} from "typeorm";

export class BaseMigration1534863273608 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "watch_session" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "start" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "last" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "userId" integer)`);
        await queryRunner.query(`CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "twitchId" varchar NOT NULL, "username" varchar NOT NULL, "email" varchar NOT NULL, "avatar" varchar NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "temporary_watch_session" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "start" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "last" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "userId" integer, CONSTRAINT "FK_661824d1af2805b7846382d6270" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE)`);
        await queryRunner.query(`INSERT INTO "temporary_watch_session"("id", "start", "last", "userId") SELECT "id", "start", "last", "userId" FROM "watch_session"`);
        await queryRunner.query(`DROP TABLE "watch_session"`);
        await queryRunner.query(`ALTER TABLE "temporary_watch_session" RENAME TO "watch_session"`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "watch_session" RENAME TO "temporary_watch_session"`);
        await queryRunner.query(`CREATE TABLE "watch_session" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "start" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "last" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "userId" integer)`);
        await queryRunner.query(`INSERT INTO "watch_session"("id", "start", "last", "userId") SELECT "id", "start", "last", "userId" FROM "temporary_watch_session"`);
        await queryRunner.query(`DROP TABLE "temporary_watch_session"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "watch_session"`);
    }

}
