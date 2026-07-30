import { MigrationInterface, QueryRunner } from "typeorm";

export class Uzchess1785383807802 implements MigrationInterface {
  name = "Uzchess1785383807802";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "coursePurchases" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "courseId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_81d34ae23c9501694ab062cbd24" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_deb9eddbcb88b2660f72c496d5" ON "coursePurchases"  ("courseId", "userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "coursePurchases" ADD CONSTRAINT "FK_37b463e56d173c75987648c6911" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "coursePurchases" ADD CONSTRAINT "FK_d970091ff600587ffedd7086e67" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "coursePurchases" DROP CONSTRAINT "FK_d970091ff600587ffedd7086e67"`,
    );
    await queryRunner.query(
      `ALTER TABLE "coursePurchases" DROP CONSTRAINT "FK_37b463e56d173c75987648c6911"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_deb9eddbcb88b2660f72c496d5"`,
    );
    await queryRunner.query(`DROP TABLE "coursePurchases"`);
  }
}
