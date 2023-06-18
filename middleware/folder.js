const createPath = require("../utils/path");

const folderHandler = (req, res, next) => {
    let requestFolder = req.body['folder'] || '/';
    const absoluteFolder = createPath(requestFolder);
    
    while (requestFolder.startsWith('/')) {
        requestFolder = requestFolder.replace('/', '');
    }
    requestFolder = '/' + requestFolder;
    
    req.folder = {
        requestFolder,
        absoluteFolder
    }

    next();
}

module.exports = folderHandler;