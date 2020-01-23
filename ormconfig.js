module.exports = {
    "type": process.env.DB_TYPE,
    "database": process.env.DB,
    "host": process.env.DB_HOST,
    "username": process.env.DB_USERNAME,
    "password": process.env.DB_PASSWORD,
    "charset": "utf8mb4",
    "synchronize": false,
    "logging": false,
    "entities": [
        "database/entity/**/*.ts"
    ],
    "migrations": [
        "database/migration/**/*.ts"
    ],
    "subscribers": [
        "database/subscriber/**/*.ts"
    ],
    "cli": {
        "entitiesDir": "database/entity",
        "migrationsDir": "database/migration",
        "subscribersDir": "database/subscriber"
    }
};

