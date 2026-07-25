import { MigrationInterface, QueryRunner } from "typeorm";

export class Uzchess1784952683105 implements MigrationInterface {
    name = 'Uzchess1784952683105'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "books" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "title" character varying(256) NOT NULL, "price" integer NOT NULL, "discountPrice" integer, "cover" character varying(256) NOT NULL, "categoryId" integer NOT NULL, "difficultyId" integer NOT NULL, "languageId" integer NOT NULL, CONSTRAINT "PK_f3f2f25a099d24e12545b70b022" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "bookAuthors" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "bookId" integer NOT NULL, "authorId" integer NOT NULL, CONSTRAINT "PK_f8839277e6a9522deda341457ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ratings" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "bookId" integer NOT NULL, "userId" integer NOT NULL, "score" smallint NOT NULL, CONSTRAINT "PK_0f31425b073219379545ad68ed9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_3fd6157e97d427f1c04dfe5d1a" ON "ratings"  ("bookId", "userId") `);
        await queryRunner.query(`ALTER TABLE "books" ADD CONSTRAINT "FK_a0f13454de3df36e337e01dbd55" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "books" ADD CONSTRAINT "FK_78f9d0c7bf6c0588b6d06fd1aef" FOREIGN KEY ("difficultyId") REFERENCES "difficulty"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "books" ADD CONSTRAINT "FK_49060974a6295b7f70ac2c102b5" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookAuthors" ADD CONSTRAINT "FK_c0d5117680dbe9914b8514a0b85" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookAuthors" ADD CONSTRAINT "FK_cec4332b3f1a87bbb56a41fae34" FOREIGN KEY ("authorId") REFERENCES "authors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ratings" ADD CONSTRAINT "FK_0563ca767066800a8b2123e6d15" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ratings" ADD CONSTRAINT "FK_4d0b0e3a4c4af854d225154ba40" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ratings" DROP CONSTRAINT "FK_4d0b0e3a4c4af854d225154ba40"`);
        await queryRunner.query(`ALTER TABLE "ratings" DROP CONSTRAINT "FK_0563ca767066800a8b2123e6d15"`);
        await queryRunner.query(`ALTER TABLE "bookAuthors" DROP CONSTRAINT "FK_cec4332b3f1a87bbb56a41fae34"`);
        await queryRunner.query(`ALTER TABLE "bookAuthors" DROP CONSTRAINT "FK_c0d5117680dbe9914b8514a0b85"`);
        await queryRunner.query(`ALTER TABLE "books" DROP CONSTRAINT "FK_49060974a6295b7f70ac2c102b5"`);
        await queryRunner.query(`ALTER TABLE "books" DROP CONSTRAINT "FK_78f9d0c7bf6c0588b6d06fd1aef"`);
        await queryRunner.query(`ALTER TABLE "books" DROP CONSTRAINT "FK_a0f13454de3df36e337e01dbd55"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3fd6157e97d427f1c04dfe5d1a"`);
        await queryRunner.query(`DROP TABLE "ratings"`);
        await queryRunner.query(`DROP TABLE "bookAuthors"`);
        await queryRunner.query(`DROP TABLE "books"`);
    }

}
