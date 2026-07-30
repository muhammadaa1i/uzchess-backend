import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: "postgres",
  synchronize: false,
  url: process.env.DATABASE_URL,
  entities: ["dist/**/*.entity.js"],
};
