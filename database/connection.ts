import {Connection, getConnection} from "typeorm";
const crypto = require("crypto");

export function getDBConnection() {
    let repository: Connection;

    if (process.env.NODE_ENV === "test") {
        repository = getConnection("test");
    }
    else {
        repository = getConnection();
    }

    return repository;
}

export function randomString(n: number = 20) {
    return crypto.randomBytes(n).toString('hex');
}