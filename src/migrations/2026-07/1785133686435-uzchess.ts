import { MigrationInterface, QueryRunner } from "typeorm";

export class Uzchess1785133686435 implements MigrationInterface {
    name = 'Uzchess1785133686435'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "courseLessons" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "sectionId" integer NOT NULL, "title" character varying(256) NOT NULL, "video" character varying(256) NOT NULL, "thumbnail" character varying(256), "duration" integer NOT NULL, "order" integer NOT NULL, CONSTRAINT "PK_0025dab46496f8dfa677939c773" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "courseSections" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "courseId" integer NOT NULL, "title" character varying(256) NOT NULL, "order" integer NOT NULL, CONSTRAINT "PK_cf394f0c7ed24362f151d407c25" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "courseLessons" ADD CONSTRAINT "FK_2e993d8bfd8d53dfdccafec44d7" FOREIGN KEY ("sectionId") REFERENCES "courseSections"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "courseSections" ADD CONSTRAINT "FK_072cc75af9f1b86ecac5a54fb85" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courseSections" DROP CONSTRAINT "FK_072cc75af9f1b86ecac5a54fb85"`);
        await queryRunner.query(`ALTER TABLE "courseLessons" DROP CONSTRAINT "FK_2e993d8bfd8d53dfdccafec44d7"`);
        await queryRunner.query(`DROP TABLE "courseSections"`);
        await queryRunner.query(`DROP TABLE "courseLessons"`);
    }

}
