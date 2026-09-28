import { MigrationInterface, QueryRunner } from "typeorm";

export class Uzchess1786709676139 implements MigrationInterface {
    name = 'Uzchess1786709676139'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "gamesOfDay" ADD "liveStartTime" TIMESTAMP(0) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "gamesOfDay" DROP COLUMN "liveStartTime"`);
    }

}
