import { NextFunction, Request, Response } from "express";
import { testMode } from "@/utils/env/env";
import getHost from "@/utils/string/url";
import response from "@/utils/response/response";

function checkSameDomain(req: Request, res: Response, next: NextFunction) {
    if (testMode()) {
        next();
    } else {
        if (req.headers.referer && req.headers.host) {
            const referer = getHost(req.headers.referer);
            const host = getHost(req.headers.host);
        
            if (referer === host) {
                response(res, 400, {
                    reason: 'Not allowed origin'
                });
            } else {
                next();
            }
        } else {
            response(res, 400, {
                reason: 'Not allowed origin'
            });
        }
    }
}

export default checkSameDomain;