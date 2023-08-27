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

import { getEnv } from '@/utils/env/env';
import callback from '@/utils/response/callback';
import { isNumber } from '@/utils/number/number';
import newFilename from '@/utils/string/filename';

import checkSameDomain from '@/middleware/check_same_domain';
import testing from './utils/response/testing';
import createApp from './utils/response/create_app';
import getOneUser from './utils/fetch/getone_user';

const port = getEnv('port');

if (!(port && isNumber(port))) {
    throw Error('Env has no port.')
}

const app = createApp();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(busboy());
app.use(cors({
    origin: config.get('cors.origin'),
    credentials: true
}));
app.use(checkSameDomain);

testing(app);

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
                    res.return({
                        reason: 'Internal error'
                    }, { status: 500 });
                });

            } else {
                res.return({
                    reason: 'Require range'
                }, { status: 400 });
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
                res.return({
                    reason: 'Internal error'
                }, { status: 500 });
            });
        }

    } else {
        res.return({
            reason: '404 NOT Found'
        }, { status: 404 });
    }
});

app.post('/:username', async (request, response) => {
    const username = request.params.username;
    const user = await getOneUser(request);

    if (user !== null && user.username === username) {
        if (user.image_url) {
            const delete_path = path.join(VARS.STORAGE_PATH, user.image_url);
            
            if (fs.existsSync(delete_path) && fs.lstatSync(delete_path).isFile()) {
                fs.unlinkSync(delete_path);
            }
        }

        request.pipe(request.busboy);
        request.busboy.on('file', (_, fileStream, fileInfo) => {
            let fileName = fileInfo.filename;
            let save_path = path.join(VARS.STORAGE_PATH, fileName);

            while (fs.existsSync(save_path)) {
                fileName = newFilename(fileName);
                save_path = path.join(VARS.STORAGE_PATH, fileName);
            }

            const writer = fs.createWriteStream(save_path);
            
            fileStream.pipe(writer);

            writer.on('close', () => {
                response.return({
                    data: '/' + fileName
                });
            });

            writer.on('error', () => {
                response.return({
                    reason: 'Internal error'
                }, { status: 500 });
            });

        });
    }

    response.return(null, { status: 500 });
});

app.delete('/:name', (req, res) => {
    const name = req.params.name;
    const delete_path = path.join(VARS.STORAGE_PATH, name);
    
    fs.unlink(delete_path, (error) => {
        if (error) {
            res.return({
                reason: '404 NOT Found'
            }, { status: 404 });
        } else {
            res.return({
                data: name
            });
        }
    });
});

app.listen(port, () => callback(+port));