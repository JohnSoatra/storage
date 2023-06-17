const path = require('path');
const fs = require('fs');
const { ROOT_PATH } = require('../constants/var');
const STORAGE_PATH = process.env.STORAGE_PATH || path.join(ROOT_PATH, 'storage');

function createPath(folder) {
    if (folder) {
        const _path = path.join(STORAGE_PATH, folder);
        
        if (!(fs.existsSync(_path) && fs.lstatSync(_path).isDirectory())) {
            fs.mkdirSync(_path, { recursive: true });
        }

        return _path;
    }

    return STORAGE_PATH;
}

module.exports = createPath;