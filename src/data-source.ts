import {DataSource} from "typeorm";

export const AppDataSource = new DataSource({
    type: 'postgres',
    synchronize: false,
    url: 'postgresql://postgres:001007@localhost:5432/uzchess',
    entities: ['dist/**/*.entity.js'],
    migrations:['dist/src/migrations/*.js']
})