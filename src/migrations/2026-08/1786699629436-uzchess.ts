import { MigrationInterface, QueryRunner } from "typeorm";

export class Uzchess1786699629436 implements MigrationInterface {
  name = "Uzchess1786699629436";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "players" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP(0) NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP(0) NOT NULL DEFAULT now(), "name" character varying(128) NOT NULL, "avatarUrl" character varying(256), "rating" integer NOT NULL, "ratingChange" integer, CONSTRAINT "PK_de22b8fdeee0c33ab55ae71da3b" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "players"`);
  }
}
