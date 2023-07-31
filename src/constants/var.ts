import path from 'path';

const rootPath = path.dirname(path.dirname(__dirname));

const VARS = {
    ROOT_PATH: rootPath,
    ENV_PATH: path.join(rootPath, '.env'),
    STORAGE_PATH: path.join(rootPath, 'storage')
}

export default VARS;