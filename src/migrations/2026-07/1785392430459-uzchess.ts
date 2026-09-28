import { MigrationInterface, QueryRunner } from "typeorm";

export class Uzchess1785392430459 implements MigrationInterface {
    name = 'Uzchess1785392430459'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."coursePurchases_status_enum" AS ENUM('pending', 'success', 'failed')`);
        await queryRunner.query(`ALTER TABLE "coursePurchases" ADD "status" "public"."coursePurchases_status_enum" NOT NULL DEFAULT 'pending'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "coursePurchases" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."coursePurchases_status_enum"`);
    }

}
