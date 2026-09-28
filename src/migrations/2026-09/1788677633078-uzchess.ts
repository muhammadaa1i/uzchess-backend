import { MigrationInterface, QueryRunner } from "typeorm";

export class Uzchess1788677633078 implements MigrationInterface {
    name = 'Uzchess1788677633078'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "contact_messages" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP(0) NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP(0) NOT NULL DEFAULT now(), "name" character varying(256) NOT NULL, "email" character varying(256) NOT NULL, "message" text NOT NULL, CONSTRAINT "PK_b74f96eb2edd977ccfba6533293" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "contact_messages"`);
    }

}
