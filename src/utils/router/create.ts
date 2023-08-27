import { Request, Response, Router } from "express";

type Method = 'get'|'post';

type Logic<T extends DataResponse> = (
    request: Request,
    response: Response
) => Promise<ResponseResult<T>>

type MapRouter = {
    [path: string]: Router
}

function useRouter(map: MapRouter) {
    const router = Router();

    for (let key in map) {
        router.use(key, map[key]);
    }

    return router;
}

function oneRouter<T extends DataResponse>(method: Method, logic: Logic<T>): Router {
    const router = Router();

    router[method]('/', async (request, response) => {
        if (request.method.toLowerCase() === method) {
            const result = await logic(request, response);
    
            response.return(
                result.data,
                {
                    reason: result.reason,
                    status: result.status
                }
            );
        } else {
            response.return(
                null,
                {
                    reason: 'method not allowed.',
                    status: 400
                }
            );
        }
    });

    return router;
}

export {
    useRouter,
    oneRouter
};