import { Response } from "express";

function response(
    res: Response,
    status: number,
    result: ResponseResult
) {
    res.status(status).send(result);
}

export default response;