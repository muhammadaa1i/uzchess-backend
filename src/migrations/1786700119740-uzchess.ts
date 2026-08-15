import { MigrationInterface, QueryRunner } from "typeorm";

export class Uzchess1786700119740 implements MigrationInterface {
  name = "Uzchess1786700119740";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."gamesOfDay_gametype_enum" AS ENUM('rapid', 'blitz', 'bullet')`,
    );
    await queryRunner.query(
      `CREATE TABLE "gamesOfDay" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP(0) NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP(0) NOT NULL DEFAULT now(), "videoUrl" character varying(256) NOT NULL, "thumbnailUrl" character varying(256) NOT NULL, "durationSeconds" integer NOT NULL, "gameType" "public"."gamesOfDay_gametype_enum" NOT NULL, "whitePlayerId" integer NOT NULL, "blackPlayerId" integer NOT NULL, "isActive" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_0b2136622261494b83b167d682b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "gamesOfDay" ADD CONSTRAINT "FK_0c48fb6c5ce7136e152b4b4aa50" FOREIGN KEY ("whitePlayerId") REFERENCES "players"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "gamesOfDay" ADD CONSTRAINT "FK_1c87d722a6db5fb9b30f9353aeb" FOREIGN KEY ("blackPlayerId") REFERENCES "players"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gamesOfDay" DROP CONSTRAINT "FK_1c87d722a6db5fb9b30f9353aeb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "gamesOfDay" DROP CONSTRAINT "FK_0c48fb6c5ce7136e152b4b4aa50"`,
    );
    await queryRunner.query(`DROP TABLE "gamesOfDay"`);
    await queryRunner.query(`DROP TYPE "public"."gamesOfDay_gametype_enum"`);
  }
}
