import { MigrationInterface, QueryRunner } from "typeorm";

export class Uzchess1786701633654 implements MigrationInterface {
    name = 'Uzchess1786701633654'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "banners" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP(0) NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP(0) NOT NULL DEFAULT now(), "title" character varying(128) NOT NULL, "subtitle" character varying(256), "imageUrl" character varying(256), "linkUrl" character varying(256), "badgeText" character varying(32), "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_e9b186b959296fcb940790d31c3" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "banners"`);
    }

}
