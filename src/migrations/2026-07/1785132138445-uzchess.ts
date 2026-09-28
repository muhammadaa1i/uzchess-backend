import { MigrationInterface, QueryRunner } from "typeorm";

export class Uzchess1785132138445 implements MigrationInterface {
    name = 'Uzchess1785132138445'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "courseFavourites" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "courseId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_2515006dc7882c30d0ed82dde6a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_ef13ab75eda95861052dd39199" ON "courseFavourites"  ("courseId", "userId") `);
        await queryRunner.query(`ALTER TABLE "courseFavourites" ADD CONSTRAINT "FK_30dc8727650a382ca0bcbd9f43c" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "courseFavourites" ADD CONSTRAINT "FK_eb3b8ce2a490fdcf4396978ab2a" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courseFavourites" DROP CONSTRAINT "FK_eb3b8ce2a490fdcf4396978ab2a"`);
        await queryRunner.query(`ALTER TABLE "courseFavourites" DROP CONSTRAINT "FK_30dc8727650a382ca0bcbd9f43c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ef13ab75eda95861052dd39199"`);
        await queryRunner.query(`DROP TABLE "courseFavourites"`);
    }

}
