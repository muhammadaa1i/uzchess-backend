import { MigrationInterface, QueryRunner } from "typeorm";

export class Uzchess1786778054782 implements MigrationInterface {
    name = 'Uzchess1786778054782'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "players" DROP COLUMN "rating"`);
        await queryRunner.query(`ALTER TABLE "players" DROP COLUMN "ratingChange"`);
        await queryRunner.query(`ALTER TABLE "players" ADD "country" character varying(3) NOT NULL`);
        await queryRunner.query(`CREATE TYPE "public"."players_title_enum" AS ENUM('none', 'cm', 'fm', 'im', 'gm', 'wcm', 'wfm', 'wim', 'wgm')`);
        await queryRunner.query(`ALTER TABLE "players" ADD "title" "public"."players_title_enum" NOT NULL DEFAULT 'none'`);
        await queryRunner.query(`ALTER TABLE "players" ADD "classicalRating" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "players" ADD "classicalRatingChange" integer`);
        await queryRunner.query(`ALTER TABLE "players" ADD "rapidRating" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "players" ADD "rapidRatingChange" integer`);
        await queryRunner.query(`ALTER TABLE "players" ADD "blitzRating" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "players" ADD "blitzRatingChange" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "players" DROP COLUMN "blitzRatingChange"`);
        await queryRunner.query(`ALTER TABLE "players" DROP COLUMN "blitzRating"`);
        await queryRunner.query(`ALTER TABLE "players" DROP COLUMN "rapidRatingChange"`);
        await queryRunner.query(`ALTER TABLE "players" DROP COLUMN "rapidRating"`);
        await queryRunner.query(`ALTER TABLE "players" DROP COLUMN "classicalRatingChange"`);
        await queryRunner.query(`ALTER TABLE "players" DROP COLUMN "classicalRating"`);
        await queryRunner.query(`ALTER TABLE "players" DROP COLUMN "title"`);
        await queryRunner.query(`DROP TYPE "public"."players_title_enum"`);
        await queryRunner.query(`ALTER TABLE "players" DROP COLUMN "country"`);
        await queryRunner.query(`ALTER TABLE "players" ADD "ratingChange" integer`);
        await queryRunner.query(`ALTER TABLE "players" ADD "rating" integer NOT NULL`);
    }

}
