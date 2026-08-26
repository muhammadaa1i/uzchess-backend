import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { resolveTypeOrmConnectionOptions } from "@/core/configs/typeorm/typeorm-connection.util";

export const typeOrmConfig: TypeOrmModuleOptions = resolveTypeOrmConnectionOptions();
