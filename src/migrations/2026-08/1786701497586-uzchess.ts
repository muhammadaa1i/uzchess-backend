import { MigrationInterface, QueryRunner } from "typeorm";

export class Uzchess1786701497586 implements MigrationInterface {
    name = 'Uzchess1786701497586'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "news" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP(0) NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP(0) NOT NULL DEFAULT now(), "title" character varying(256) NOT NULL, "excerpt" text NOT NULL, "imageUrl" character varying(256), "publishedAt" date NOT NULL, CONSTRAINT "PK_39a43dfcb6007180f04aff2357e" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "news"`);
    }

}
