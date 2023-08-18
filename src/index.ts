import 'module-alias/register';

import VARS from '@/constants/vars';

import dotEnv from 'dotenv';

dotEnv.config({
    path: VARS.ENV_PATH
});

import busboy from 'connect-busboy';
import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import config from 'config';
import mime from 'mime-types';

import response from '@/utils/response/response';
import { getEnv } from '@/utils/env/env';
import callback from '@/utils/response/callback';
import { isNumber } from '@/utils/number/number';
import newFilename from '@/utils/string/filename';

import checkSameDomain from '@/middleware/check_same_domain';

const port = getEnv('port');

if (!(port && isNumber(port))) {
    throw Error('Env has no port.')
}

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(busboy());
app.use(cors({ origin: config.get('cors.origin') }));
app.use(checkSameDomain);

app.get('/', (_, res) => {
    response(res, 200, {
        reason: 'Server is working'
    });
});

app.get('/:name', (req, res) => {
    const name = req.params.name;
    const getPath = path.join(VARS.STORAGE_PATH, name);

    if (fs.existsSync(getPath) && fs.lstatSync(getPath).isFile()) {
        const detail = fs.lstatSync(getPath);

        if (mime.lookup(getPath).toString().includes('video/')) {
            const range = req.headers.range;
            const segmentSize = req.query['segment-size'] || '1';
            
            if (range && segmentSize && isNumber(segmentSize.toString())) {
                const chuckSize = +segmentSize * (10 ** 6);
                const videoSize = detail.size;
                const start = Number(range.replace(/\D/g, ""));
                const end = Math.min(start + chuckSize, videoSize - 1);
                const reader = fs.createReadStream(getPath, { start, end });

                const headers = {
                    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
                    "Accept-Ranges": "bytes",
                    "Content-Length": (end - start + 1),
                    "Content-Type": mime.lookup(getPath).toString()
                };

                res.writeHead(206, headers);

                reader.pipe(res);
                
                reader.on('close', () => {
                    res.status(200).end();
                });

                reader.on('error', () => {
                    response(res, 500, {
                        reason: 'Internal error'
                    });
                });

            } else {
                response(res, 400, {
                    reason: 'Require range'
                });
            }

        } else {
            const reader = fs.createReadStream(getPath);
            const headers = {
                'Content-Length': detail.size,
                'Content-Type': mime.lookup(getPath).toString()
            }

            res.writeHead(200, headers);

            reader.pipe(res);

            reader.on('close', () => {
                res.status(200).end();
            });

            reader.on('error', () => {
                response(res, 500, {
                    reason: 'Internal error'
                });
            });
        }

    } else {
        response(res, 404, {
            reason: '404 NOT Found'
        });
    }
});

app.post('/', (req, res) => {
    req.pipe(req.busboy);
    req.busboy.on('file', (_, fileStream, fileInfo) => {
        let fileName = fileInfo.filename;
        let save_path = path.join(VARS.STORAGE_PATH, fileName);

        while (fs.existsSync(save_path)) {
            fileName = newFilename(fileName);
            save_path = path.join(VARS.STORAGE_PATH, fileName);
        }

        const writer = fs.createWriteStream(save_path);
        
        fileStream.pipe(writer);

        writer.on('close', () => {
            response(res, 200, {
                data: fileName
            });
        });

        writer.on('error', () => {
            response(res, 500, {
                reason: 'Internal Error'
            });
        });

    });
});

app.delete('/:name', (req, res) => {
    const name = req.params.name;
    const delete_path = path.join(VARS.STORAGE_PATH, name);
    
    fs.unlink(delete_path, (error) => {
        if (error) {
            response(res, 404, {
                reason: '404 NOT Found'
            });
        } else {
            response(res, 200, {
                data: name
            });
        }
    });
});

app.listen(port, () => callback(+port));