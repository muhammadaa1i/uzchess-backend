import { MigrationInterface, QueryRunner } from "typeorm";

export class Uzchess1784349259796 implements MigrationInterface {
    name = 'Uzchess1784349259796'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "difficulty" ADD "icon" character varying(256) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "difficulty" DROP COLUMN "icon"`);
    }

}
