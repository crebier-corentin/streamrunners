import { ConnectionOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

const data: any = dotenv.parse(fs.readFileSync(`${__dirname}/../.env`));

const config: ConnectionOptions = {
    type: 'mysql',
    host: data.DB_HOST,
    username: data.DB_USERNAME,
    password: data.DB_PASSWORD,
    database: data.DB,
    charset: 'utf8mb4',
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: false,
    migrationsRun: true,
    logging: true,
    logger: 'file',
    migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
    cli: {
        migrationsDir: 'src/migrations',
    },
};

export = config;
