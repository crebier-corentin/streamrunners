import {MigrationInterface, QueryRunner} from "typeorm";

export class ManualPointsMigration1535468320288 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "manual_points" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "amount" integer NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer)`);
        await queryRunner.query(`CREATE TABLE "temporary_stream_queue" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "amount" integer NOT NULL DEFAULT (100), "time" integer NOT NULL DEFAULT (60), "current" integer NOT NULL DEFAULT (0), "start" datetime, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer, CONSTRAINT "FK_4c57791f489aeae47721e7885c2" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_stream_queue"("id", "amount", "time", "current", "start", "createdAt", "userId") SELECT "id", "amount", "time", "current", "start", "createdAt", "userId" FROM "stream_queue"`);
        await queryRunner.query(`DROP TABLE "stream_queue"`);
        await queryRunner.query(`ALTER TABLE "temporary_stream_queue" RENAME TO "stream_queue"`);
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
        await queryRunner.query(`ALTER TABLE "stream_queue" RENAME TO "temporary_stream_queue"`);
        await queryRunner.query(`CREATE TABLE "stream_queue" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "amount" integer NOT NULL DEFAULT (100), "time" integer NOT NULL DEFAULT (60), "current" integer NOT NULL DEFAULT (0), "start" datetime, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer, CONSTRAINT "FK_4c57791f489aeae47721e7885c2" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "stream_queue"("id", "amount", "time", "current", "start", "createdAt", "userId") SELECT "id", "amount", "time", "current", "start", "createdAt", "userId" FROM "temporary_stream_queue"`);
        await queryRunner.query(`DROP TABLE "temporary_stream_queue"`);
        await queryRunner.query(`DROP TABLE "manual_points"`);
    }

}
