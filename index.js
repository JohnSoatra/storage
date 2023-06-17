const busboy = require('connect-busboy');
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const authHandler = require('./middleware/auth');
const folderHandler = require('./middleware/folder');
const response = require('./utils/response');

const PORT = process.env.PORT || 9999;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(busboy());

app.use(authHandler);
app.use(folderHandler);

app.post('/', (req, res) => {
    console.log('join');
    req.pipe(req.busboy);
    req.busboy.on('file', (_, fileStream, fileInfo) => {
        const save_path = path.join(req.absoluteFolder, fileInfo.filename);
        const newStream = fs.createWriteStream(save_path);
        
        fileStream.pipe(newStream);
        newStream.on('close', () => {
            res.status(200).send({
                'reason': 'successfully',
                file: path.join(req.requestFolder, fileInfo.filename)
            });
        });
        newStream.on('error', () => {
            response(res, 500, 'Internal Error');
        });
    });
});

app.get('/list', (req, res) => {
    fs.readdir(req.absoluteFolder, (error, files) => {
        if (error) {
            response(res, 404, '404 NOT Found');
        } else {
            res.status(200).send({
                'reason': 'successfully',
                files: files.map(file => path.join(req.requestFolder, file))
            });
        }
    });
});

app.get('/:name', (req, res) => {
    const name = req.params.name;
    const get_path = path.join(req.absoluteFolder, name);
    
    fs.readFile(get_path, (error, data) => {
        if (error) {
            response(res, 404, '404 NOT Found');
        } else {
            res.write(data);
            res.status(200).end();
        }
    });
});

app.delete('/:name', (req, res) => {
    const name = req.params.name;
    const delete_path = path.join(req.absoluteFolder, name);
    
    fs.unlink(delete_path, (error) => {
        if (error) {
            response(res, 404, '404 NOT Found');
        } else {
            response(res, 200, 'successfully');
        }
    });
});

app.listen(PORT);