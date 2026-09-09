import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * One-time bootstrap: grants superadmin to a known account so there is at
 * least one user who can call POST /users/:id/roles to manage everyone
 * else's roles. No-ops if that account hasn't registered yet in this
 * environment — if that happens, register the account first, then re-run
 * this migration (`npm run revert` followed by `npm run migrate`, assuming
 * it's still the latest migration) to actually grant the role.
 */
export class Uzchess1788969761434 implements MigrationInterface {
  name = "Uzchess1788969761434";

  private readonly bootstrapEmail = "muhammadaalin01@gmail.com";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "userRoles" ("userId", "roleId")
             SELECT u."id", r."id"
             FROM "users" u, "roles" r
             WHERE u."email" = $1
               AND r."title" = 'superadmin'
               AND NOT EXISTS (
                 SELECT 1 FROM "userRoles" ur
                 WHERE ur."userId" = u."id" AND ur."roleId" = r."id"
               )`,
      [this.bootstrapEmail],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "userRoles" ur
             USING "users" u, "roles" r
             WHERE ur."userId" = u."id"
               AND ur."roleId" = r."id"
               AND u."email" = $1
               AND r."title" = 'superadmin'`,
      [this.bootstrapEmail],
    );
  }
}
