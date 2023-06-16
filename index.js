const busboy = require('connect-busboy');
const express = require('express');
const fs = require('fs');
const app = express();

const BASE_PATH = '/Users/soatra/storage/'
const PORT = 9999

app.use(busboy());

app.get('/:name', (req, res, next) => {
    const name = req.params.name;
    
    fs.readFile(BASE_PATH + name, (error, data) => {
        if (!data) {
            res.status(404).end('404 NOT Found');
        } else {
            res.write(data);
            res.status(200).end();
        }
    });
});

app.delete('/:name', (req, res, next) => {
    const name = req.params.name;
    
    fs.unlink(BASE_PATH + name, (error) => {
        if (error) {
            res.status(404).end('404 NOT Found');
        } else {
            res.status(200).send({
                'reason': 'successfully'
            });
        }
    });
});

app.post('/', (req, res, next) => {
    req.pipe(req.busboy);
    req.busboy.on('file', function (_, fileStream, fileInfo) {
        const newStream = fs.createWriteStream(fileInfo.filename);
        
        fileStream.pipe(newStream);
        newStream.on('close', () => {
            res.status(200).send({
                'reason': 'successfully'
            });
        });
        newStream.on('error', () => {
            res.status(500).send({
                'reason': 'Internal Error'
            });
        });
    });
});

app.listen(PORT);