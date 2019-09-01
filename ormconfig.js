let config;

if (process.env.NODE_ENV === "production") {
    config = {
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
}
else {
    config = [
        {
            "name": "default",
            "type": "sqlite",
            "database": "database.sqlite",
            "synchronize": true,
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
        },
        {
            "name": "test",
            "type": "sqlite",
            "database": "test.sqlite",
            "synchronize": true,
            "dropSchema": true,
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
        }
    ];
}


module.exports = config;
