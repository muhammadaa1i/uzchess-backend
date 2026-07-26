import "./env";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "postgres",
  synchronize: false,
  url: process.env.DATABASE_URL,
  entities: ["dist/**/*.entity.js"],
  migrations: ["dist/src/migrations/*.js"],
});
