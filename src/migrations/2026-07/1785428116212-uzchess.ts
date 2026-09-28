import { MigrationInterface, QueryRunner } from "typeorm";

export class Uzchess1785428116212 implements MigrationInterface {
    name = 'Uzchess1785428116212'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "lessonProgresses" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lessonId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_92e58e3b6d2981a27b633fe9145" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_025c7aff6499317b277553f6a7" ON "lessonProgresses"  ("lessonId", "userId") `);
        await queryRunner.query(`ALTER TABLE "lessonProgresses" ADD CONSTRAINT "FK_ba08146b8b8067b5e478228a4b4" FOREIGN KEY ("lessonId") REFERENCES "courseLessons"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lessonProgresses" ADD CONSTRAINT "FK_d162bdd31f3b1d2884460ce2b39" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lessonProgresses" DROP CONSTRAINT "FK_d162bdd31f3b1d2884460ce2b39"`);
        await queryRunner.query(`ALTER TABLE "lessonProgresses" DROP CONSTRAINT "FK_ba08146b8b8067b5e478228a4b4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_025c7aff6499317b277553f6a7"`);
        await queryRunner.query(`DROP TABLE "lessonProgresses"`);
    }

}
