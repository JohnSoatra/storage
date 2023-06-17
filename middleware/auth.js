const sqlite = require('sqlite3');
const bcrypt = require('bcrypt');
const path = require('path');
const { SQL, ROOT_PATH } = require('../constants/var');
const response = require('../utils/response');
const { dbExec, dbGet } = require('../utils/sqlite');
const DB_PATH = process.env.DB_PATH || path.join(ROOT_PATH, 'db.db');

function authHandler(req, res, next) {
    const database = new sqlite.Database(DB_PATH);
    const auth = req.headers.authorization;
    const folder = req.body['folder'] || '/';

    if (auth) {
        let result;
        const user = JSON.parse(auth);

        database.on('open', async () =>  {
            const root = {
                username: process.env.ROOT_USERNAME || 'root',
                password: bcrypt.hashSync(process.env.ROOT_PASSWORD || 'root', 10)
            }
            await dbExec(SQL.CREATE_TABLE_USERS, database);
            await dbExec(SQL.CREATE_TABLE_FOLDERS, database);
            await dbExec(SQL.SUPER_USER(root.username, root.password), database);

            if (
                user.username === root.username &&
                bcrypt.compareSync(user.password, root.password)
            ) {
                req.root = true;
                next();
            } else {
                result = await dbGet(SQL.SELECT_USER(user.username), database);

                if (result.error) {
                    response(res, 500, `Internal error`);
                } else {
                    const dbUser = result.data;

                    if (bcrypt.compareSync(user.password, dbUser.password)) {
                        result = await dbGet(SQL.SELECT_FOLDERS(dbUser.id), database);

                        if (result.error) {
                            response(res, 400, `User has no right for this folder: ${path}`);
                        } else {
                            const folders = result.data;

                            if (folders.includes(folder)) {
                                next();
                            } else {
                                response(res, 400, `User has no right for this folder: ${path}`);
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
    } else {
        response(res, 400, `No authentication provided`);
    }
}

module.exports = authHandler;