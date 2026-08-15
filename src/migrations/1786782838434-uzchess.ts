import { MigrationInterface, QueryRunner } from "typeorm";

export class Uzchess1786782838434 implements MigrationInterface {
    name = 'Uzchess1786782838434'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "players" ADD "rankChange" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "players" DROP COLUMN "rankChange"`);
    }

}
