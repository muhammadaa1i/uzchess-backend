import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '001007',
  database: 'uzchess',
  synchronize: true,
  entities: [join(__dirname, '../../**/*.entity{.ts,.js}')],
};
