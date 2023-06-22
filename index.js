const busboy = require('connect-busboy');
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const config = require('config');
const mime = require('mime-types');

const response = require('./utils/response');
const { getEnv, testMode } = require('./utils/env');
const callback = require('./utils/callback');
const { ROOT_PATH } = require('./constants/var');
const { getHost } = require('./utils/url');

const app = express();
const PORT = getEnv('port') || 9999;
const STORAGE_PATH = getEnv('storage_path', path.join(ROOT_PATH, 'storage'));

app.use((req, res, next) => {
    const referer = getHost(req.headers.referer);
    const host = getHost(req.headers.host);

    if (!testMode() && (!referer || referer === host)) {
        response(res, 400, 'Not allowed origin');
    }

    next();
});

app.use(cors({
    origin: config.get('cors.origin'),
}));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(busboy());

app.get('/', (_, res) => {
    response(res, 200, 'Server is working');
});

app.post('/', (req, res) => {
    req.pipe(req.busboy);
    req.busboy.on('file', (_, fileStream, fileInfo) => {
        let fileName = fileInfo.filename
        let save_path = path.join(STORAGE_PATH, fileName);

        while (fs.existsSync(save_path)) {
            fileName = '1-' + fileName;
            save_path = path.join(STORAGE_PATH, fileName);
        }

        const writer = fs.createWriteStream(save_path);
        
        fileStream.pipe(writer);
        writer.on('close', () => {
            res.status(200).send({
                'reason': 'successfully',
                file: fileName
            });
        });
        writer.on('error', () => response(res, 500, 'Internal Error'));
    });
});

app.get('/list', (req, res) => {
    fs.readdir(STORAGE_PATH, (error, files) => {
        if (error) {
            response(res, 404, '404 NOT Found');
        } else {
            res.status(200).send({
                'reason': 'successfully',
                files: files
            });
        }
    });
});

app.get('/:name', (req, res) => {
    const name = req.params.name;
    const getPath = path.join(ROOT_PATH, 'storage', name);
    const detail = fs.lstatSync(getPath);

    if (fs.existsSync(getPath) && detail.isFile()) {
        if (mime.lookup(getPath).includes('video/')) {
            const range = req.headers.range;
            const segmentSize = req.query['segment-size'] || 1;
            
            if (range) {
                const chuckSize = segmentSize * (10 ** 6); // 10 ** 6 = 1MB
                const videoSize = detail.size;
                const start = Number(range.replace(/\D/g, ""));
                const end = Math.min(start + chuckSize, videoSize - 1);
                const reader = fs.createReadStream(getPath, { start, end });
                
                const headers = {
                    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
                    "Accept-Ranges": "bytes",
                    "Content-Length": (end - start + 1),
                    "Content-Type": mime.lookup(getPath),
                };

                res.writeHead(206, headers);
                reader.pipe(res);
                reader.on('close', () => res.status(200).end());
                reader.on('error', () => response(res, 500, 'Internal error'));
            } else {
                response(res, 400, 'Require range');
            }
        } else {
            const reader = fs.createReadStream(getPath);
            const headers = {
                'Content-Length': detail.size,
                'Content-Type': mime.lookup(getPath)
            }

            res.writeHead(200, headers);
            reader.pipe(res);
            reader.on('close', () => res.status(200).end());
            reader.on('error', () => response(res, 500, 'Internal error'));
        }
    } else {
        response(res, 404, '404 NOT Found');
    }
});

app.delete('/:name', (req, res) => {
    const name = req.params.name;
    const delete_path = path.join(STORAGE_PATH, name);
    
    fs.unlink(delete_path, (error) => {
        if (error) {
            response(res, 404, '404 NOT Found');
        } else {
            response(res, 200, 'successfully');
        }
    });
});

app.listen(PORT, callback);