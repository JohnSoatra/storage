import fs from 'fs';
import toObject from '@/utils/array/array';
import VARS from '@/constants/vars';

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

function getEnv(name: string) {
    const name_lower = name.toLowerCase();
    const name_upper = name.toUpperCase();

    const result = __env[name] || __env[name_lower] || __env[name_upper];

    if (result) {
        return result;
    }

    throw Error(`Env file has no ${name}.`);
}

function testMode() {
    return getEnv('NODE_ENV').toLowerCase() !== 'production';
}

export {
    getEnv,
    testMode
};