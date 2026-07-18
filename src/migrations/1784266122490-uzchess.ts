import { MigrationInterface, QueryRunner } from "typeorm";

export class Uzchess1784266122490 implements MigrationInterface {
    name = 'Uzchess1784266122490'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courseCategories" ALTER COLUMN title TYPE VARCHAR(32)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courseCategories" ALTER COLUMN title TYPE VARCHAR(64)`);
        }

}
