const createPath = require("../utils/path");
const response = require("../utils/response");

const folderHandler = (req, res, next) => {
    let auth = req.headers.authentication || {};

    try {
        auth = JSON.parse(auth);
    } catch {
        response(res, 400, 'No authentication provided');
    }

    const requestFolder = auth.folder || ('/' + (auth.user || ''));
    const absoluteFolder = createPath(requestFolder);

    req.folder = {
        requestFolder,
        absoluteFolder
    }

    next();
}

module.exports = folderHandler;