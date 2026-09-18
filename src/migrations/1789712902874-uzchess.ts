import { MigrationInterface, QueryRunner } from "typeorm";

export class Uzchess1789712902874 implements MigrationInterface {
  name = "Uzchess1789712902874";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."games_status_enum" AS ENUM('ongoing', 'completed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "games" ADD "status" "public"."games_status_enum" NOT NULL DEFAULT 'completed'`,
    );
    await queryRunner.query(
      `ALTER TABLE "games" ALTER COLUMN "whiteScore" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "games" ALTER COLUMN "blackScore" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "games" ALTER COLUMN "blackScore" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "games" ALTER COLUMN "whiteScore" SET NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "games" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."games_status_enum"`);
  }
}
