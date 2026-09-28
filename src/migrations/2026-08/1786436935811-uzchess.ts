import { MigrationInterface, QueryRunner } from "typeorm";

export class Uzchess1786436935811 implements MigrationInterface {
    name = 'Uzchess1786436935811'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."coupons_type_enum" AS ENUM('percent', 'fixed')`);
        await queryRunner.query(`CREATE TABLE "coupons" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "code" character varying(64) NOT NULL, "type" "public"."coupons_type_enum" NOT NULL, "value" integer NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "expiresAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_e025109230e82925843f2a14c48" UNIQUE ("code"), CONSTRAINT "PK_d7ea8864a0150183770f3e9a8cb" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "coupons"`);
        await queryRunner.query(`DROP TYPE "public"."coupons_type_enum"`);
    }

}
