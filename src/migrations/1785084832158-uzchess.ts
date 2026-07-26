import { MigrationInterface, QueryRunner } from "typeorm";

export class Uzchess1785084832158 implements MigrationInterface {
    name = 'Uzchess1785084832158'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "books" ADD "description" text`);
        await queryRunner.query(`ALTER TABLE "books" ADD "pageCount" integer`);
        await queryRunner.query(`ALTER TABLE "books" ADD "publishedYear" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "books" DROP COLUMN "publishedYear"`);
        await queryRunner.query(`ALTER TABLE "books" DROP COLUMN "pageCount"`);
        await queryRunner.query(`ALTER TABLE "books" DROP COLUMN "description"`);
    }

}
