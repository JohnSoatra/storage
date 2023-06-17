function dbExec(sql, database) {
    return new Promise((res, _) => {
        database.exec(sql, (error) => {
            res(error);
        });
    });
}

function dbGet(sql, data) {
    return new Promise((res, _) => {
        database.get(sql, (error, data) => {
            res({error, data});
        });
    });
}

module.exports = {
    dbExec,
    dbGet
};