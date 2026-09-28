import { MigrationInterface, QueryRunner } from "typeorm";

export class Uzchess1785088723548 implements MigrationInterface {
    name = 'Uzchess1785088723548'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "courseRatings" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "courseId" integer NOT NULL, "userId" integer NOT NULL, "score" smallint NOT NULL, CONSTRAINT "PK_c00aee19a33f594744dcf309320" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_d106c38a6ae79963ea647b44a4" ON "courseRatings"  ("courseId", "userId") `);
        await queryRunner.query(`ALTER TABLE "courseRatings" ADD CONSTRAINT "FK_03ab8c3a80ce6e0fcc7c94f5dff" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "courseRatings" ADD CONSTRAINT "FK_8dc39209f5ebc79370da2fd6c38" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courseRatings" DROP CONSTRAINT "FK_8dc39209f5ebc79370da2fd6c38"`);
        await queryRunner.query(`ALTER TABLE "courseRatings" DROP CONSTRAINT "FK_03ab8c3a80ce6e0fcc7c94f5dff"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d106c38a6ae79963ea647b44a4"`);
        await queryRunner.query(`DROP TABLE "courseRatings"`);
    }

}
