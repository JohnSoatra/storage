import VARS from "@/constants/vars";
import { oneRouter } from "@/utils/router/create";
import { isUndefined } from "@/utils/utils";
import path from "path";
import fs from 'fs';

const getFileRouter = oneRouter<GetFileRouter>('get',
    async (request) => {
        const name = request.query['name']?.toString();
        const hasAll = !isUndefined(name);

        if (hasAll) {
            const getPath = path.join(VARS.STORAGE_PATH, name!);
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
        }
    }
);

export default getFileRouter;