import {MigrationInterface, QueryRunner} from "typeorm";

export class BaseMigration1535607532943 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "stream_queue" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "amount" integer NOT NULL DEFAULT (100), "time" integer NOT NULL DEFAULT (60), "current" integer NOT NULL DEFAULT (0), "start" datetime, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer)`);
        await queryRunner.query(`CREATE TABLE "stream_session" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "amount" integer NOT NULL DEFAULT (100), "start" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "last" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "ended" boolean NOT NULL DEFAULT (0), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer)`);
        await queryRunner.query(`CREATE TABLE "watch_session" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "start" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "last" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "userId" integer)`);
        await queryRunner.query(`CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "twitchId" varchar NOT NULL, "username" varchar NOT NULL, "display_name" varchar NOT NULL, "email" varchar NOT NULL, "avatar" varchar NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "manual_points" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "amount" integer NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer)`);
        await queryRunner.query(`CREATE TABLE "temporary_stream_queue" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "amount" integer NOT NULL DEFAULT (100), "time" integer NOT NULL DEFAULT (60), "current" integer NOT NULL DEFAULT (0), "start" datetime, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer, CONSTRAINT "FK_4c57791f489aeae47721e7885c2" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE)`);
        await queryRunner.query(`INSERT INTO "temporary_stream_queue"("id", "amount", "time", "current", "start", "createdAt", "userId") SELECT "id", "amount", "time", "current", "start", "createdAt", "userId" FROM "stream_queue"`);
        await queryRunner.query(`DROP TABLE "stream_queue"`);
        await queryRunner.query(`ALTER TABLE "temporary_stream_queue" RENAME TO "stream_queue"`);
        await queryRunner.query(`CREATE TABLE "temporary_stream_session" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "amount" integer NOT NULL DEFAULT (100), "start" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "last" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "ended" boolean NOT NULL DEFAULT (0), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer, CONSTRAINT "FK_5d859efcfd20003f8d8447c875a" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE)`);
        await queryRunner.query(`INSERT INTO "temporary_stream_session"("id", "amount", "start", "last", "ended", "createdAt", "userId") SELECT "id", "amount", "start", "last", "ended", "createdAt", "userId" FROM "stream_session"`);
        await queryRunner.query(`DROP TABLE "stream_session"`);
        await queryRunner.query(`ALTER TABLE "temporary_stream_session" RENAME TO "stream_session"`);
        await queryRunner.query(`CREATE TABLE "temporary_watch_session" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "start" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "last" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "userId" integer, CONSTRAINT "FK_661824d1af2805b7846382d6270" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE)`);
        await queryRunner.query(`INSERT INTO "temporary_watch_session"("id", "start", "last", "userId") SELECT "id", "start", "last", "userId" FROM "watch_session"`);
        await queryRunner.query(`DROP TABLE "watch_session"`);
        await queryRunner.query(`ALTER TABLE "temporary_watch_session" RENAME TO "watch_session"`);
        await queryRunner.query(`CREATE TABLE "temporary_manual_points" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "amount" integer NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer, CONSTRAINT "FK_20ad463604853de5518010becbc" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE)`);
        await queryRunner.query(`INSERT INTO "temporary_manual_points"("id", "amount", "createdAt", "userId") SELECT "id", "amount", "createdAt", "userId" FROM "manual_points"`);
        await queryRunner.query(`DROP TABLE "manual_points"`);
        await queryRunner.query(`ALTER TABLE "temporary_manual_points" RENAME TO "manual_points"`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "manual_points" RENAME TO "temporary_manual_points"`);
        await queryRunner.query(`CREATE TABLE "manual_points" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "amount" integer NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer)`);
        await queryRunner.query(`INSERT INTO "manual_points"("id", "amount", "createdAt", "userId") SELECT "id", "amount", "createdAt", "userId" FROM "temporary_manual_points"`);
        await queryRunner.query(`DROP TABLE "temporary_manual_points"`);
        await queryRunner.query(`ALTER TABLE "watch_session" RENAME TO "temporary_watch_session"`);
        await queryRunner.query(`CREATE TABLE "watch_session" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "start" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "last" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "userId" integer)`);
        await queryRunner.query(`INSERT INTO "watch_session"("id", "start", "last", "userId") SELECT "id", "start", "last", "userId" FROM "temporary_watch_session"`);
        await queryRunner.query(`DROP TABLE "temporary_watch_session"`);
        await queryRunner.query(`ALTER TABLE "stream_session" RENAME TO "temporary_stream_session"`);
        await queryRunner.query(`CREATE TABLE "stream_session" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "amount" integer NOT NULL DEFAULT (100), "start" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "last" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "ended" boolean NOT NULL DEFAULT (0), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer)`);
        await queryRunner.query(`INSERT INTO "stream_session"("id", "amount", "start", "last", "ended", "createdAt", "userId") SELECT "id", "amount", "start", "last", "ended", "createdAt", "userId" FROM "temporary_stream_session"`);
        await queryRunner.query(`DROP TABLE "temporary_stream_session"`);
        await queryRunner.query(`ALTER TABLE "stream_queue" RENAME TO "temporary_stream_queue"`);
        await queryRunner.query(`CREATE TABLE "stream_queue" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "amount" integer NOT NULL DEFAULT (100), "time" integer NOT NULL DEFAULT (60), "current" integer NOT NULL DEFAULT (0), "start" datetime, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer)`);
        await queryRunner.query(`INSERT INTO "stream_queue"("id", "amount", "time", "current", "start", "createdAt", "userId") SELECT "id", "amount", "time", "current", "start", "createdAt", "userId" FROM "temporary_stream_queue"`);
        await queryRunner.query(`DROP TABLE "temporary_stream_queue"`);
        await queryRunner.query(`DROP TABLE "manual_points"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "watch_session"`);
        await queryRunner.query(`DROP TABLE "stream_session"`);
        await queryRunner.query(`DROP TABLE "stream_queue"`);
    }

}
