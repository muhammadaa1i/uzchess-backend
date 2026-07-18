import {MigrationInterface, QueryRunner} from "typeorm";

export class Uzchess1784267019399 implements MigrationInterface {
    name = 'Uzchess1784267019399'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE languages ALTER COLUMN code TYPE VARCHAR(6)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE languages ALTER COLUMN code TYPE VARCHAR(4)`);
    }

}
