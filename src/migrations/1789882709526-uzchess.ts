import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Adds 10 ranking-demo players across 5 new countries (Russia, India, Norway,
 * USA, Armenia) so the deployed Ranking page's country filter has more than
 * just Uzbekistan. Guarded by name so it's a no-op if a row already exists.
 *
 * Uses a separate existence check + a plain INSERT ... VALUES (matching the
 * pattern in 1789147689930-uzchess.ts) instead of a single
 * `INSERT ... SELECT $1 ... WHERE NOT EXISTS (... = $1)` statement: reusing
 * $1 in both the untyped SELECT list and a typed comparison makes Postgres
 * unable to resolve a single type for the parameter ("inconsistent types
 * deduced for parameter $1" / 42P08).
 */
export class Uzchess1789882709526 implements MigrationInterface {
  name = "Uzchess1789882709526";

  private readonly players: [string, string, string, number, number, number][] = [
    ["Dmitri Volkov", "ru", "gm", 2720, 2680, 2640],
    ["Yelena Sokolova", "ru", "wgm", 2440, 2410, 2380],
    ["Arjun Mehta", "in", "gm", 2690, 2650, 2600],
    ["Priya Nair", "in", "wim", 2350, 2320, 2290],
    ["Erik Haugen", "no", "gm", 2705, 2660, 2620],
    ["Ingrid Solberg", "no", "wfm", 2280, 2250, 2230],
    ["Michael Carter", "us", "im", 2500, 2460, 2430],
    ["Sarah Johnson", "us", "wgm", 2420, 2390, 2360],
    ["Vardan Grigoryan", "am", "gm", 2670, 2630, 2590],
    ["Lusine Petrosyan", "am", "wim", 2360, 2330, 2300],
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const [name, country, title, classical, rapid, blitz] of this.players) {
      const existing = await queryRunner.query(
        `SELECT 1 FROM players WHERE name = $1`,
        [name],
      );
      if (existing.length === 0) {
        await queryRunner.query(
          `INSERT INTO players (name, country, title, "classicalRating", "rapidRating", "blitzRating")
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [name, country, title, classical, rapid, blitz],
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const names = this.players.map(([name]) => name);
    await queryRunner.query(`DELETE FROM players WHERE name = ANY($1)`, [names]);
  }
}
