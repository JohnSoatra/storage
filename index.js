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

const PORT = getEnv('port') || 9999;
const app = express();

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
        let save_path = path.join(req.folder.absoluteFolder, fileName);

        while (fs.existsSync(save_path)) {
            fileName += '-1';
            save_path = path.join(req.folder.absoluteFolder, fileName);
        }

        const newStream = fs.createWriteStream(save_path);
        
        fileStream.pipe(newStream);

        newStream.on('close', () => {
            res.status(200).send({
                'reason': 'successfully',
                file: path.join(req.folder.requestFolder, fileName)
            });
        });
        newStream.on('error', () => {
            response(res, 500, 'Internal Error');
        });
    });
});

app.get('/list', (req, res) => {
    fs.readdir(req.folder.absoluteFolder, (error, files) => {
        if (error) {
            response(res, 404, '404 NOT Found');
        } else {
            res.status(200).send({
                'reason': 'successfully',
                files: files.map(file => path.join(req.folder.requestFolder, file))
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
            
            if (!range) {
                response(res, 400, 'Require range');
            }

            const chuckSize = (10 ** 6); // 10 ** 6 = 1MB
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
            reader.on('end', () => res.status(200).end());
            reader.on('error', () => response(res, 500, 'Internal error'));

        } else {
            const reader = fs.createReadStream(getPath);
            const headers = {
                'Content-Length': detail.size,
                'Content-Type': mime.lookup(getPath)
            }

            res.writeHead(200, headers);
            reader.pipe(res);
            reader.on('end', () => res.status(200).end());
            reader.on('error', () => response(res, 500, 'Internal error'));
        }
    } else {
        response(res, 404, '404 NOT Found');
    }
});

app.delete('/:name', (req, res) => {
    const name = req.params.name;
    const delete_path = path.join(req.folder.absoluteFolder, name);
    
    fs.unlink(delete_path, (error) => {
        if (error) {
            response(res, 404, '404 NOT Found');
        } else {
            response(res, 200, 'successfully');
        }
    });
});

app.listen(PORT, callback);