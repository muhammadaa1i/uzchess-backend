import { MigrationInterface, QueryRunner } from "typeorm";

export class Uzchess1788961760485 implements MigrationInterface {
  name = "Uzchess1788961760485";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "roles" ("title", "description")
             VALUES ('user', 'Default role granted to every registered account'),
                    ('admin', 'Elevated role for staff managing content and orders'),
                    ('superadmin', 'Full administrative access, including role management')
             ON CONFLICT ("title") DO NOTHING`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "roles" WHERE "title" IN ('user', 'admin', 'superadmin')`,
    );
  }
}
