import { MigrationInterface, QueryRunner } from "typeorm";

export class Uzchess1785133725919 implements MigrationInterface {
    name = 'Uzchess1785133725919'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courseRatings" ADD "comment" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courseRatings" DROP COLUMN "comment"`);
    }

}
