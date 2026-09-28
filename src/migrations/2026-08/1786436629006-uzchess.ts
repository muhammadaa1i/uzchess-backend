import { MigrationInterface, QueryRunner } from "typeorm";

export class Uzchess1786436629006 implements MigrationInterface {
    name = 'Uzchess1786436629006'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cart_items" ADD "quantity" integer NOT NULL DEFAULT '1'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cart_items" DROP COLUMN "quantity"`);
    }

}
