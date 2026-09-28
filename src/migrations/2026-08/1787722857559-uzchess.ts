import { MigrationInterface, QueryRunner } from "typeorm";

export class Uzchess1787722857559 implements MigrationInterface {
    name = 'Uzchess1787722857559'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "rolePermissions"`);
        await queryRunner.query(`DROP TABLE "userPermissions"`);
        await queryRunner.query(`DROP TABLE "permissions"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "permissions"
             (
                 "id"        SERIAL NOT NULL,
                 "createdAt" TIMESTAMP(0) NOT NULL DEFAULT now(),
                 "updatedAt" TIMESTAMP(0) NOT NULL DEFAULT now(),
                 "resource"  character varying(64) NOT NULL,
                 "action"    character varying(64) NOT NULL,
                 CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id")
             )`,
        );
        await queryRunner.query(
            `CREATE TABLE "userPermissions"
             (
                 "id"           SERIAL NOT NULL,
                 "createdAt"    TIMESTAMP(0) NOT NULL DEFAULT now(),
                 "updatedAt"    TIMESTAMP(0) NOT NULL DEFAULT now(),
                 "userId"       integer NOT NULL,
                 "permissionId" integer NOT NULL,
                 "isAllowed"    boolean NOT NULL,
                 CONSTRAINT "PK_5cbba686fa42e45a2914c590261" PRIMARY KEY ("id")
             )`,
        );
        await queryRunner.query(
            `CREATE TABLE "rolePermissions"
             (
                 "id"           SERIAL NOT NULL,
                 "createdAt"    TIMESTAMP(0) NOT NULL DEFAULT now(),
                 "updatedAt"    TIMESTAMP(0) NOT NULL DEFAULT now(),
                 "roleId"       integer NOT NULL,
                 "permissionId" integer NOT NULL,
                 CONSTRAINT "PK_a6537fd825da917ef380e6672b6" PRIMARY KEY ("id")
             )`,
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

}
