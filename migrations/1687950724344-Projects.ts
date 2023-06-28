import { MigrationInterface, QueryRunner } from 'typeorm';

export class Projects1687950724344 implements MigrationInterface {
  name = 'Projects1687950724344';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "projects" ("id" SERIAL NOT NULL, "external_id" integer, "path_with_namespace" character varying, CONSTRAINT "PK_6271df0a7aed1d6c0691ce6ac50" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "merge_requests" RENAME COLUMN "chatId" TO "chat_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merge_requests" RENAME COLUMN "userId" TO "user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "approves" RENAME COLUMN "userId" to "user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "approves" RENAME COLUMN "mergeRequestId" to "merge_request_id"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merge_requests" RENAME COLUMN "chat_id" TO "chatId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merge_requests" RENAME COLUMN "user_id" TO "userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "approves" RENAME COLUMN "user_id" to "userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "approves" RENAME COLUMN "merge_request_id" to "mergeRequestId"`,
    );
    await queryRunner.query(`DROP TABLE "projects"`);
  }
}
