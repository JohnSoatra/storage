function dbExec(sql, database) {
    return new Promise((res, _) => {
        database.exec(sql, (error) => {
            res(error);
        });
    });
}

function dbGet(sql, database) {
    return new Promise((res, _) => {
        database.get(sql, (error, data) => {
            res({error, data});
        });
    });
}

function dbAll(sql, database) {
    return new Promise((res, _) => {
        database.all(sql, (error, data) => {
            res({error, data});
        });
    });
}

module.exports = {
    dbExec,
    dbGet,
    dbAll
};