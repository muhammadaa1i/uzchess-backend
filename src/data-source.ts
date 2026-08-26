import "./env";
import {DataSource, DataSourceOptions} from "typeorm";
import {resolveTypeOrmConnectionOptions} from "@/core/configs/typeorm/typeorm-connection.util";

export const AppDataSource = new DataSource({
    ...(resolveTypeOrmConnectionOptions() as DataSourceOptions),
    migrations: ["dist/src/migrations/*.js"],
});
