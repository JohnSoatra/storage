const createPath = require("../utils/path");

const folderHandler = (req, res, next) => {
    const requestFolder = req.body['folder'] || '';
    const absoluteFolder = createPath(requestFolder);
    
    req.folder = {
        requestFolder,
        absoluteFolder
    }

    next();
}

module.exports = folderHandler;