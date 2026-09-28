import { MigrationInterface, QueryRunner } from "typeorm";

export class Uzchess1785497418083 implements MigrationInterface {
    name = 'Uzchess1785497418083'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "certificates" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "courseId" integer NOT NULL, "userId" integer NOT NULL, "code" character varying NOT NULL, CONSTRAINT "UQ_e9e6937f74d9a653f0fc3299132" UNIQUE ("code"), CONSTRAINT "PK_e4c7e31e2144300bea7d89eb165" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_bd8df793beac12456464909017" ON "certificates"  ("courseId", "userId") `);
        await queryRunner.query(`ALTER TABLE "certificates" ADD CONSTRAINT "FK_e50e73bc3bdcfb0eb3d561f1494" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "certificates" ADD CONSTRAINT "FK_7d072194aef1ecb98664c83e861" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "certificates" DROP CONSTRAINT "FK_7d072194aef1ecb98664c83e861"`);
        await queryRunner.query(`ALTER TABLE "certificates" DROP CONSTRAINT "FK_e50e73bc3bdcfb0eb3d561f1494"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bd8df793beac12456464909017"`);
        await queryRunner.query(`DROP TABLE "certificates"`);
    }

}
