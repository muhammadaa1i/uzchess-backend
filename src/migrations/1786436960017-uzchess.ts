import { MigrationInterface, QueryRunner } from "typeorm";

export class Uzchess1786436960017 implements MigrationInterface {
    name = 'Uzchess1786436960017'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "delivery_settings" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "fee" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_4e465b6ab6d5d228142f32ec5d5" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "delivery_settings"`);
    }

}
