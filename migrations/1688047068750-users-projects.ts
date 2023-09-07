import { MigrationInterface, QueryRunner } from 'typeorm';

export class usersProjects1688047068750 implements MigrationInterface {
  name = 'usersProjects1688047068750';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users_projects" ("users_id" integer NOT NULL, "projects_id" integer NOT NULL, CONSTRAINT "PK_6ad4d81f2fa2e2502232a6b26bb" PRIMARY KEY ("users_id", "projects_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bbbacfb30797aa9fcae20de984" ON "users_projects" ("users_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0f4d3eb03e8a5f324bd1a0662b" ON "users_projects" ("projects_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "users_projects" ADD CONSTRAINT "FK_bbbacfb30797aa9fcae20de9847" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_projects" ADD CONSTRAINT "FK_0f4d3eb03e8a5f324bd1a0662b7" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users_projects" DROP CONSTRAINT "FK_0f4d3eb03e8a5f324bd1a0662b7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_projects" DROP CONSTRAINT "FK_bbbacfb30797aa9fcae20de9847"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0f4d3eb03e8a5f324bd1a0662b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bbbacfb30797aa9fcae20de984"`,
    );
    await queryRunner.query(`DROP TABLE "users_projects"`);
  }
}
