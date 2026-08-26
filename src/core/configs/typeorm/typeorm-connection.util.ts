import { TypeOrmModuleOptions } from "@nestjs/typeorm";

function resolveSsl(): boolean | { rejectUnauthorized: boolean } {
  if (process.env.DATABASE_SSL === "true") return { rejectUnauthorized: false };
  if (process.env.DATABASE_SSL === "false") return false;
  return process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false;
}

export function resolveTypeOrmConnectionOptions(): TypeOrmModuleOptions {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Check your .env file or environment configuration.",
    );
  }

  return {
    type: "postgres",
    url: process.env.DATABASE_URL,
    ssl: resolveSsl(),
    poolSize: Number(process.env.DATABASE_POOL_SIZE) || 10,
    connectTimeoutMS: Number(process.env.DATABASE_CONNECT_TIMEOUT_MS) || 10_000,
    extra: {
      statement_timeout: Number(process.env.DATABASE_STATEMENT_TIMEOUT_MS) || 30_000,
    },
    logging: process.env.NODE_ENV !== "production",
    synchronize: false,
    entities: ["dist/**/*.entity.js"],
  };
}
