const fs = require('fs');
const path = require('path');
const dotEnv = require('dotenv');
const config = require('config');
const toObject = require('./array');
const { ROOT_PATH } = require('../constants/var');

const ENV_PATH = path.join(ROOT_PATH, config.get('env'));

dotEnv.config({
    path: ENV_PATH
});

const __env = {
    ...process.env,
    ...readEnv()
}

function readEnv() {
    if (fs.existsSync(ENV_PATH)) {
        const text = fs.readFileSync(ENV_PATH, { encoding: 'utf-8' });
        let texts = text.split(/\r?\n/);
        texts = texts.map(text => {
            const slices = text.replace(/\s+/g, '').split('=');
    
            if (slices.length === 2) {
                return {
                    [slices[0]]: slices[1]
                }
            }
        });
        texts = texts.filter(text => typeof(text) === 'object');

        return toObject(texts);
    }
    
    return {}
}

function getEnv(name, default_) {
    const name_lower = name.toLowerCase();
    const name_upper = name.toUpperCase();

    return __env[name] || __env[name_lower] || __env[name_upper] || default_;
}

module.exports = getEnv;