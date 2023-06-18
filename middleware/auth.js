const sqlite = require('sqlite3');
const bcrypt = require('bcrypt');
const path = require('path');
const pg = require('pg');
const { SQL, ROOT_PATH } = require('../constants/var');
const response = require('../utils/response');
const { dbExec, dbGet } = require('../utils/sqlite');
const getEnv = require('../utils/env');
const trim = require('../utils/object');
const DB_PATH = process.env.DB_PATH || path.join(ROOT_PATH, 'db.db');

async function authHandler(req, res, next) {
    const dbProvider = getEnv('db_provider', 'sqlite');
    const dbName = getEnv('db_name', 'storage');
    const folder = req.requestFolder;
    let auth = req.headers.authorization;
    
    try {
        auth = JSON.parse(auth);
        if (!(auth.user && auth.password)) {
            auth = null;
        }
    } catch {
        auth = null;
    }

    if (auth) {
        let result = null;

        if (dbProvider === 'sqlite') {
            const database = new sqlite.Database(DB_PATH);

            database.on('open', async () =>  {
                const root = {
                    username: getEnv('db_user') || 'root',
                    password: bcrypt.hashSync(getEnv('db_password') || 'root', 10)
                }
                await dbExec(SQL.SQLITE.CREATE_TABLE_USERS, database);
                await dbExec(SQL.SQLITE.CREATE_TABLE_FOLDERS, database);
                await dbExec(SQL.SQLITE.SUPER_USER(root.username, root.password), database);
    
                if (
                    auth.user === root.username &&
                    bcrypt.compareSync(auth.password, root.password)
                ) {
                    req.root = true;
                    next();
                } else {
                    result = await dbGet(SQL.SQLITE.SELECT_USER(auth.user), database);
    
                    if (result.error) {
                        response(res, 500, `Internal error`);
                    } else {
                        const user = result.data;
    
                        if (bcrypt.compareSync(auth.password, user.password)) {
                            result = await dbGet(SQL.SQLITE.SELECT_FOLDERS(user.id), database);
    
                            if (result.error) {
                                response(res, 500, 'Internal error');
                            } else {
                                const folders = result.data;
    
                                if (folders.includes(folder)) {
                                    next();
                                } else {
                                    response(res, 400, `User has no right for this folder: ${folder}`);
                                }
                            }
                        } else {
                            response(res, 400, `Incorrect authentication`);
                        }
                    }
                }
            });
            
            database.on('error', () => {
                response(res, 500, 'Internal Error');
            });

        } else if (dbProvider === 'postgresql') {
            const dbUser = getEnv('db_user', process.env.USER);
            const dbPassword = getEnv('db_password', 'postgres');

            const client = new pg.Client({
                host: getEnv('db_host', 'localhost'),
                port: getEnv('db_port', 5432),
                database: getEnv('db_name', dbName),
                user: dbUser,
                password: dbPassword
            });

            try {
                await client.connect();
                
                if (auth.user === dbUser && auth.password === dbPassword) {
                    req.root = true;
                    next();
                } else {
                    await client.query(SQL.POSTGRES.CREATE_TABLE_USERS);
                    await client.query(SQL.POSTGRES.CREATE_TABLE_FOLDERS);
                    result = await client.query(SQL.POSTGRES.SELECT_USER(auth.user));

                    if (result.rowCount == 0) {
                        response(res, 400, 'Incorrect authentication');
                    } else {
                        const user = trim(result.rows[0]);

                        if (bcrypt.compareSync(auth.password, user.password)) {
                            result = await client.query(SQL.POSTGRES.SELECT_FOLDERS(user.id));
                            const folders = result.rows.map(row => trim(row));

                            if (folders.find(folder => folder.path === folder)) {
                                next();
                            } else {
                                response(res, 400, `User has no right for this folder: ${folder}`)
                            }
                        } else {
                            response(res, 400, 'Incorrect authentication');
                        }
                    }
                }
            } catch(ex) {
                console.log('Error: cannot connect to database');
                response(res, 500, 'Internal error');
            }
        } else {
            console.log('Error: database provider is incorrect');
            response(res, 500, 'Internal error');
        }
    } else {
        response(res, 400, `No authentication provided`);
    }
}

module.exports = authHandler;