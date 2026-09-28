import { MigrationInterface, QueryRunner } from "typeorm";

export class Uzchess1787650456823 implements MigrationInterface {
  name = "Uzchess1787650456823";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "news" ADD "content" text NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "news" ADD "viewsCount" integer NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "news" DROP COLUMN "viewsCount"`);
    await queryRunner.query(`ALTER TABLE "news" DROP COLUMN "content"`);
  }
}
