import {MigrationInterface, QueryRunner} from "typeorm";

export class StreamMigration1535016778493 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "stream_session" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "amount" integer NOT NULL DEFAULT (100), "start" datetime NOT NULL, "last" datetime NOT NULL, "userId" integer)`);
        await queryRunner.query(`CREATE TABLE "temporary_stream_session" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "amount" integer NOT NULL DEFAULT (100), "start" datetime NOT NULL, "last" datetime NOT NULL, "userId" integer, CONSTRAINT "FK_5d859efcfd20003f8d8447c875a" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE)`);
        await queryRunner.query(`INSERT INTO "temporary_stream_session"("id", "amount", "start", "last", "userId") SELECT "id", "amount", "start", "last", "userId" FROM "stream_session"`);
        await queryRunner.query(`DROP TABLE "stream_session"`);
        await queryRunner.query(`ALTER TABLE "temporary_stream_session" RENAME TO "stream_session"`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "stream_session" RENAME TO "temporary_stream_session"`);
        await queryRunner.query(`CREATE TABLE "stream_session" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "amount" integer NOT NULL DEFAULT (100), "start" datetime NOT NULL, "last" datetime NOT NULL, "userId" integer)`);
        await queryRunner.query(`INSERT INTO "stream_session"("id", "amount", "start", "last", "userId") SELECT "id", "amount", "start", "last", "userId" FROM "temporary_stream_session"`);
        await queryRunner.query(`DROP TABLE "temporary_stream_session"`);
        await queryRunner.query(`DROP TABLE "stream_session"`);
    }

}
