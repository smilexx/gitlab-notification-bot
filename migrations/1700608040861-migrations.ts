import { MigrationInterface, QueryRunner } from 'typeorm';

export class migrations1700608040861 implements MigrationInterface {
  name = 'migrations1700608040861';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merge_requests" RENAME COLUMN "megre_request_id" TO "merge_request_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "approves" ADD CONSTRAINT "user_merge_request" UNIQUE ("user_id", "merge_request_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "approves" DROP CONSTRAINT "user_merge_request"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merge_requests" RENAME COLUMN "merge_request_id" TO "megre_request_id"`,
    );
  }
}
