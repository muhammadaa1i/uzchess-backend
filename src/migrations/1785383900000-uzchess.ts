import { MigrationInterface, QueryRunner } from "typeorm";

export class Uzchess1785383900000 implements MigrationInterface {
  name = "Uzchess1785383900000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "coursePurchases" ("courseId", "userId") VALUES (44, 1), (45, 1), (46, 1), (44, 7), (47, 7), (44, 8)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "coursePurchases" WHERE ("courseId", "userId") IN ((44, 1), (45, 1), (46, 1), (44, 7), (47, 7), (44, 8))`,
    );
  }
}
