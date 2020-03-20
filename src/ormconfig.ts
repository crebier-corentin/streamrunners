import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { ConnectionOptions } from 'typeorm';

const data: any = dotenv.parse(fs.readFileSync(`${__dirname}/../.env`));

const config = {
    type: 'mysql',
    host: data.DB_HOST,
    username: data.DB_USERNAME,
    password: data.DB_PASSWORD,
    database: data.DB,
    charset: 'utf8mb4',
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: false,
    migrationsRun: false,
    logging: true,
    logger: 'file',
    migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
    cli: {
        migrationsDir: 'src/migrations',
    },
} as ConnectionOptions;

export = config;
