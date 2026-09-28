import { MigrationInterface, QueryRunner } from "typeorm";

export class Uzchess1784951596758 implements MigrationInterface {
  name = "Uzchess1784951596758";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "roles"
             (
                 "id"          SERIAL                   NOT NULL,
                 "createdAt"   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                 "updatedAt"   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                 "title"       character varying(64)    NOT NULL,
                 "description" text,
                 CONSTRAINT "UQ_08e86fada7ae67b1689f948e83e" UNIQUE ("title"),
                 CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id")
             )`,
    );
    await queryRunner.query(
      `CREATE TABLE "userRoles"
             (
                 "id"        SERIAL                   NOT NULL,
                 "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                 "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                 "userId"    integer                  NOT NULL,
                 "roleId"    integer                  NOT NULL,
                 CONSTRAINT "PK_f51275374b5fb007ccf0fff9806" PRIMARY KEY ("id")
             )`,
    );
    await queryRunner.query(
      `CREATE TABLE "users"
             (
                 "id"        SERIAL                   NOT NULL,
                 "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                 "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                 "username"  character varying(64)    NOT NULL,
                 "fullName"  character varying(64)    NOT NULL,
                 "password"  character varying(128)   NOT NULL,
                 CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"),
                 CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
             )`,
    );
    await queryRunner.query(
      `CREATE TABLE "userPermissions"
             (
                 "id"           SERIAL                   NOT NULL,
                 "createdAt"    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                 "updatedAt"    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                 "userId"       integer                  NOT NULL,
                 "permissionId" integer                  NOT NULL,
                 "isAllowed"    boolean                  NOT NULL,
                 CONSTRAINT "PK_5cbba686fa42e45a2914c590261" PRIMARY KEY ("id")
             )`,
    );
    await queryRunner.query(
      `CREATE TABLE "permissions"
             (
                 "id"        SERIAL                   NOT NULL,
                 "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                 "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                 "resource"  character varying(64)    NOT NULL,
                 "action"    character varying(64)    NOT NULL,
                 CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id")
             )`,
    );
    await queryRunner.query(
      `CREATE TABLE "rolePermissions"
             (
                 "id"           SERIAL                   NOT NULL,
                 "createdAt"    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                 "updatedAt"    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                 "roleId"       integer                  NOT NULL,
                 "permissionId" integer                  NOT NULL,
                 CONSTRAINT "PK_a6537fd825da917ef380e6672b6" PRIMARY KEY ("id")
             )`,
    );
    await queryRunner.query(
      `CREATE TABLE "courseCategories"
             (
                 "id"        SERIAL                   NOT NULL,
                 "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                 "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                 "title"     character varying(32)    NOT NULL,
                 CONSTRAINT "PK_6abac9e602f9ddbe55a5876d8ec" PRIMARY KEY ("id")
             )`,
    );
    await queryRunner.query(
      `CREATE TABLE "authors"
             (
                 "id"        SERIAL                   NOT NULL,
                 "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                 "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                 "fullName"  character varying(64)    NOT NULL,
                 CONSTRAINT "PK_d2ed02fabd9b52847ccb85e6b88" PRIMARY KEY ("id")
             )`,
    );
    await queryRunner.query(
      `CREATE TABLE "category"
             (
                 "id"        SERIAL                   NOT NULL,
                 "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                 "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                 "title"     character varying(64)    NOT NULL,
                 CONSTRAINT "UQ_9f16dbbf263b0af0f03637fa7b5" UNIQUE ("title"),
                 CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id")
             )`,
    );
    await queryRunner.query(
      `CREATE TABLE "difficulty"
             (
                 "id"        SERIAL                   NOT NULL,
                 "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                 "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                 "degree"    character varying(64)    NOT NULL,
                 "icon"      character varying(256)   NOT NULL,
                 CONSTRAINT "UQ_ed2c5ffed29108bd0388c839d76" UNIQUE ("degree"),
                 CONSTRAINT "PK_336e49544a076db0d9b713f7255" PRIMARY KEY ("id")
             )`,
    );
    await queryRunner.query(
      `CREATE TABLE "languages"
             (
                 "id"        SERIAL                   NOT NULL,
                 "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                 "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                 "title"     character varying(64)    NOT NULL,
                 "code"      character varying(6)     NOT NULL,
                 CONSTRAINT "UQ_06df62e773ec68318919dafacf7" UNIQUE ("title"),
                 CONSTRAINT "UQ_7397752718d1c9eb873722ec9b2" UNIQUE ("code"),
                 CONSTRAINT "PK_b517f827ca496b29f4d549c631d" PRIMARY KEY ("id")
             )`,
    );
    await queryRunner.query(
      `ALTER TABLE "userRoles"
                ADD CONSTRAINT "FK_fdf65c16d62910b4785a18cdfce" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "userRoles"
                ADD CONSTRAINT "FK_5760f2a1066eb90b4c223c16a10" FOREIGN KEY ("roleId") REFERENCES "roles" ("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "userPermissions"
                ADD CONSTRAINT "FK_f9a54628e2dcdb14a6df1da8d3b" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "userPermissions"
                ADD CONSTRAINT "FK_5fcff32fd1e0d2ad9e179c06ec6" FOREIGN KEY ("permissionId") REFERENCES "permissions" ("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "rolePermissions"
                ADD CONSTRAINT "FK_b20f4ad2fcaa0d311f925162675" FOREIGN KEY ("roleId") REFERENCES "roles" ("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "rolePermissions"
                ADD CONSTRAINT "FK_5cb213a16a7b5204c8aff881518" FOREIGN KEY ("permissionId") REFERENCES "permissions" ("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "rolePermissions" DROP CONSTRAINT "FK_5cb213a16a7b5204c8aff881518"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rolePermissions" DROP CONSTRAINT "FK_b20f4ad2fcaa0d311f925162675"`,
    );
    await queryRunner.query(
      `ALTER TABLE "userPermissions" DROP CONSTRAINT "FK_5fcff32fd1e0d2ad9e179c06ec6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "userPermissions" DROP CONSTRAINT "FK_f9a54628e2dcdb14a6df1da8d3b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "userRoles" DROP CONSTRAINT "FK_5760f2a1066eb90b4c223c16a10"`,
    );
    await queryRunner.query(
      `ALTER TABLE "userRoles" DROP CONSTRAINT "FK_fdf65c16d62910b4785a18cdfce"`,
    );
    await queryRunner.query(`DROP TABLE "languages"`);
    await queryRunner.query(`DROP TABLE "difficulty"`);
    await queryRunner.query(`DROP TABLE "category"`);
    await queryRunner.query(`DROP TABLE "authors"`);
    await queryRunner.query(`DROP TABLE "courseCategories"`);
    await queryRunner.query(`DROP TABLE "rolePermissions"`);
    await queryRunner.query(`DROP TABLE "permissions"`);
    await queryRunner.query(`DROP TABLE "userPermissions"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "userRoles"`);
    await queryRunner.query(`DROP TABLE "roles"`);
  }
}
