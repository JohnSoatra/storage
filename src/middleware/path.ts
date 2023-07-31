import createPath from '@/utils/path/path';
import { NextFunction, Request, Response } from 'express';

const pathHandler = (req: Request, _: Response, next: NextFunction) => {
    const requestPath = req.body['path'] || '/';
    const fullRequestPath = createPath(requestPath);

    req.requestPath = {
        path: requestPath,
        fullPath: fullRequestPath
    }

    next();
}

export default pathHandler;