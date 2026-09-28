import { MigrationInterface, QueryRunner } from "typeorm";

export class Uzchess1786436725996 implements MigrationInterface {
    name = 'Uzchess1786436725996'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_items" ADD "quantity" integer NOT NULL DEFAULT '1'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "quantity"`);
    }

}
