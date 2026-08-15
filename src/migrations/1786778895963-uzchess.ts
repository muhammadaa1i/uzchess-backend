import { MigrationInterface, QueryRunner } from "typeorm";

export class Uzchess1786778895963 implements MigrationInterface {
    name = 'Uzchess1786778895963'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "games" DROP CONSTRAINT "FK_d82cd828cc51dddffe072491b12"`);
        await queryRunner.query(`ALTER TABLE "games" DROP CONSTRAINT "FK_8f33cad53bfe672070963ad65e4"`);
        await queryRunner.query(`ALTER TABLE "gamesOfDay" DROP CONSTRAINT "FK_0c48fb6c5ce7136e152b4b4aa50"`);
        await queryRunner.query(`ALTER TABLE "gamesOfDay" DROP CONSTRAINT "FK_1c87d722a6db5fb9b30f9353aeb"`);
        await queryRunner.query(`ALTER TABLE "games" ADD CONSTRAINT "FK_d82cd828cc51dddffe072491b12" FOREIGN KEY ("whitePlayerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "games" ADD CONSTRAINT "FK_8f33cad53bfe672070963ad65e4" FOREIGN KEY ("blackPlayerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "gamesOfDay" ADD CONSTRAINT "FK_0c48fb6c5ce7136e152b4b4aa50" FOREIGN KEY ("whitePlayerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "gamesOfDay" ADD CONSTRAINT "FK_1c87d722a6db5fb9b30f9353aeb" FOREIGN KEY ("blackPlayerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "gamesOfDay" DROP CONSTRAINT "FK_1c87d722a6db5fb9b30f9353aeb"`);
        await queryRunner.query(`ALTER TABLE "gamesOfDay" DROP CONSTRAINT "FK_0c48fb6c5ce7136e152b4b4aa50"`);
        await queryRunner.query(`ALTER TABLE "games" DROP CONSTRAINT "FK_8f33cad53bfe672070963ad65e4"`);
        await queryRunner.query(`ALTER TABLE "games" DROP CONSTRAINT "FK_d82cd828cc51dddffe072491b12"`);
        await queryRunner.query(`ALTER TABLE "gamesOfDay" ADD CONSTRAINT "FK_1c87d722a6db5fb9b30f9353aeb" FOREIGN KEY ("blackPlayerId") REFERENCES "players"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "gamesOfDay" ADD CONSTRAINT "FK_0c48fb6c5ce7136e152b4b4aa50" FOREIGN KEY ("whitePlayerId") REFERENCES "players"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "games" ADD CONSTRAINT "FK_8f33cad53bfe672070963ad65e4" FOREIGN KEY ("blackPlayerId") REFERENCES "players"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "games" ADD CONSTRAINT "FK_d82cd828cc51dddffe072491b12" FOREIGN KEY ("whitePlayerId") REFERENCES "players"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
