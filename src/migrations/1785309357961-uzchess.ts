import { MigrationInterface, QueryRunner } from "typeorm";

export class Uzchess1785309357961 implements MigrationInterface {
    name = 'Uzchess1785309357961'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "avatar" character varying(256)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "avatar"`);
    }

}
