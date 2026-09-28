import { MigrationInterface, QueryRunner } from "typeorm";

export class Uzchess1786699830680 implements MigrationInterface {
  name = "Uzchess1786699830680";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."games_gametype_enum" AS ENUM('rapid', 'blitz', 'bullet')`,
    );
    await queryRunner.query(
      `CREATE TABLE "games" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP(0) NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP(0) NOT NULL DEFAULT now(), "whitePlayerId" integer NOT NULL, "blackPlayerId" integer NOT NULL, "whiteScore" integer NOT NULL, "blackScore" integer NOT NULL, "gameType" "public"."games_gametype_enum" NOT NULL, "movesCount" integer NOT NULL, "playedAt" date NOT NULL, CONSTRAINT "PK_c9b16b62917b5595af982d66337" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "games" ADD CONSTRAINT "FK_d82cd828cc51dddffe072491b12" FOREIGN KEY ("whitePlayerId") REFERENCES "players"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "games" ADD CONSTRAINT "FK_8f33cad53bfe672070963ad65e4" FOREIGN KEY ("blackPlayerId") REFERENCES "players"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "games" DROP CONSTRAINT "FK_8f33cad53bfe672070963ad65e4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "games" DROP CONSTRAINT "FK_d82cd828cc51dddffe072491b12"`,
    );
    await queryRunner.query(`DROP TABLE "games"`);
    await queryRunner.query(`DROP TYPE "public"."games_gametype_enum"`);
  }
}
