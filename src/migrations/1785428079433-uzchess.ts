import { MigrationInterface, QueryRunner } from "typeorm";

export class Uzchess1785428079433 implements MigrationInterface {
    name = 'Uzchess1785428079433'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courseLessons" ADD "isFree" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courseLessons" DROP COLUMN "isFree"`);
    }

}
