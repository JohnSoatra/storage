const path = require('path');

const ROOT_PATH = path.dirname(__dirname);
const SQL = {
    SQLITE: {
        CREATE_TABLE_USERS: `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            username CHAR(40) UNIQUE  NOT NULL,
            password CHAR(100) NOT NULL
        );`,
        CREATE_TABLE_FOLDERS: `CREATE TABLE IF NOT EXISTS folders (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            path CHAR(200) NOT NULL UNIQUE,
            user_id INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );`,
    
        SUPER_USER: (username, password) => `INSERT OR IGNORE INTO users (username, password) VALUES ("${username}", "${password}")`,
        SELECT_USER: (username) => `SELECT * FROM users WHERE username="${username}";`,
        SELECT_FOLDERS: (user_id) => `SELECT * FROM folders WHERE user_id=${user_id};`,
    },
    POSTGRES: {
        CREATE_TABLE_USERS: `CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY NOT NULL,
            username CHAR(40) UNIQUE  NOT NULL,
            password CHAR(100) NOT NULL
        );`,
        CREATE_TABLE_FOLDERS: `CREATE TABLE IF NOT EXISTS folders (
            id SERIAL PRIMARY KEY NOT NULL,
            path CHAR(200) NOT NULL UNIQUE,
            user_id INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );`,
    
        SELECT_USER: (username) => `SELECT * FROM users WHERE username='${username}';`,
        SELECT_FOLDERS: (user_id) => `SELECT * FROM folders WHERE user_id=${user_id};`,
    }
}

module.exports = {
    ROOT_PATH,
    SQL
}