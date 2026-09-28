import { MigrationInterface, QueryRunner } from "typeorm";

export class Uzchess1785929614990 implements MigrationInterface {
    name = 'Uzchess1785929614990'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "firstName" character varying(64)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "lastName" character varying(64)`);

        const users = (await queryRunner.query(
            `SELECT "id", "fullName" FROM "users"`,
        )) as { id: number; fullName: string }[];
        for (const user of users) {
            const spaceIndex = user.fullName.indexOf(" ");
            const firstName =
                spaceIndex === -1 ? user.fullName : user.fullName.slice(0, spaceIndex);
            const lastName =
                spaceIndex === -1 ? "" : user.fullName.slice(spaceIndex + 1);
            await queryRunner.query(
                `UPDATE "users" SET "firstName" = $1, "lastName" = $2 WHERE "id" = $3`,
                [firstName, lastName, user.id],
            );
        }

        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "firstName" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "lastName" SET NOT NULL`);

        await queryRunner.query(`ALTER TABLE "users" ADD "email" character varying(128)`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")`);
        await queryRunner.query(`ALTER TABLE "users" ADD "birthDate" date`);

        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "fullName"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "fullName" character varying(64)`);

        const users = (await queryRunner.query(
            `SELECT "id", "firstName", "lastName" FROM "users"`,
        )) as { id: number; firstName: string; lastName: string }[];
        for (const user of users) {
            const fullName = user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.firstName;
            await queryRunner.query(
                `UPDATE "users" SET "fullName" = $1 WHERE "id" = $2`,
                [fullName, user.id],
            );
        }

        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "fullName" SET NOT NULL`);

        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "birthDate"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lastName"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "firstName"`);
    }

}
