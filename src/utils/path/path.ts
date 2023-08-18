import path from 'path';
import fs from 'fs';
import VARS from '@/constants/vars';

function createPath(requestPath: string) {
    const _path = path.join(VARS.STORAGE_PATH, requestPath);
        
    if (!(fs.existsSync(_path) && fs.lstatSync(_path).isDirectory())) {
        fs.mkdirSync(
            _path,
            {
                recursive: true
            }
        );
    }

    return _path;
}

export default createPath;