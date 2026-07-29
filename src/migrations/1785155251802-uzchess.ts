import { MigrationInterface, QueryRunner } from "typeorm";

export class Uzchess1785155251802 implements MigrationInterface {
    name = 'Uzchess1785155251802'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "moduleCount"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses" ADD "moduleCount" integer NOT NULL`);
    }

}
