import { MigrationInterface, QueryRunner } from "typeorm";

export class Uzchess1786686960193 implements MigrationInterface {
    name = 'Uzchess1786686960193'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD "orderNumber" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "UQ_59b0c3b34ea0fa5562342f24143" UNIQUE ("orderNumber")`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "fullName" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "phone" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "email" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "phone"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "fullName"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "UQ_59b0c3b34ea0fa5562342f24143"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "orderNumber"`);
    }

}
