import { NextFunction, Request, Response } from "express";
import { testMode } from "@/utils/env/env";
import getHost from "@/utils/string/url";
import { isUndefined } from "@/utils/utils";

function checkSameDomain(request: Request, response: Response, next: NextFunction) {
    if (testMode()) {
        next();
    } else {
        if (!isUndefined(request.headers.referer) && !isUndefined(request.headers.host)) {
            const referer = getHost(request.headers.referer!);
            const host = getHost(request.headers.host!);

            if (referer === host) {
                response.return(
                    'Not allowed origin',
                    {
                        status: 400
                    }
                );
            } else {
                next();
            }
        } else {
            response.return(
                'Not allowed origin',
                {
                    status: 400
                }
            );
        }
    }
}

export default checkSameDomain;