import fs from 'fs';
import dotEnv from 'dotenv';
import config from 'config';
import toObject from '@/utils/array/array';
import VARS from '@/constants/var';;

dotEnv.config({
    path: VARS.ENV_PATH
});

const __env = {
    ...process.env,
    ...readEnv()
}

function readEnv() {
    if (fs.existsSync(VARS.ENV_PATH)) {
        const text = fs.readFileSync(VARS.ENV_PATH, { encoding: 'utf-8' });
        const texts = text.split(/\r?\n/);
        const _texts = texts
            .map(text => {
                const slices = text.replace(/\s+/g, '').split('=');
        
                if (slices.length === 2) {
                    return {
                        [slices[0]]: slices[1]
                    }
                }
            })
            .filter(obj => obj !== undefined);

        return toObject(_texts as {[key: string]: string}[]);
    }
    
    throw Error('Server has no env file.');
}

function getEnv(name: string, default_?: string) {
    const name_lower = name.toLowerCase();
    const name_upper = name.toUpperCase();

    return __env[name] || __env[name_lower] || __env[name_upper] || default_;
}

function testMode() {
    return getEnv('NODE_ENV') !== 'Production';
}

export {
    getEnv,
    testMode
};