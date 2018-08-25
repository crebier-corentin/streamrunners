import {Connection, getConnection} from "typeorm";

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