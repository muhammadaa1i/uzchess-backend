import { MigrationInterface, QueryRunner } from "typeorm";

export class Uzchess1786784821735 implements MigrationInterface {
    name = 'Uzchess1786784821735'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "players" ADD "birthDate" date`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "players" DROP COLUMN "birthDate"`);
    }

}
