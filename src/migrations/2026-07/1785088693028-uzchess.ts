import { MigrationInterface, QueryRunner } from "typeorm";

export class Uzchess1785088693028 implements MigrationInterface {
    name = 'Uzchess1785088693028'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "courses" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "title" character varying(256) NOT NULL, "price" integer NOT NULL, "discountPrice" integer, "cover" character varying(256) NOT NULL, "description" text, "moduleCount" integer NOT NULL, "categoryId" integer NOT NULL, "difficultyId" integer NOT NULL, "languageId" integer NOT NULL, CONSTRAINT "PK_3f70a487cc718ad8eda4e6d58c9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "courseAuthors" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "courseId" integer NOT NULL, "authorId" integer NOT NULL, CONSTRAINT "PK_3cd13aac1112675de97af29d37d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_c730473dfb837b3e62057cd9447" FOREIGN KEY ("categoryId") REFERENCES "courseCategories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_87136dee8b3b8d5ca093961c5e5" FOREIGN KEY ("difficultyId") REFERENCES "difficulty"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_a09de3e6027500ac44609a8055f" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "courseAuthors" ADD CONSTRAINT "FK_d0963994b35e3ddf920cd55bad6" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "courseAuthors" ADD CONSTRAINT "FK_1fcce68c4a50d45e26bcdefb597" FOREIGN KEY ("authorId") REFERENCES "authors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courseAuthors" DROP CONSTRAINT "FK_1fcce68c4a50d45e26bcdefb597"`);
        await queryRunner.query(`ALTER TABLE "courseAuthors" DROP CONSTRAINT "FK_d0963994b35e3ddf920cd55bad6"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_a09de3e6027500ac44609a8055f"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_87136dee8b3b8d5ca093961c5e5"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_c730473dfb837b3e62057cd9447"`);
        await queryRunner.query(`DROP TABLE "courseAuthors"`);
        await queryRunner.query(`DROP TABLE "courses"`);
    }

}
