import { Request } from "express";
import { getEnv } from "../env/env";
import fetch from "cross-fetch";
import getJson from "../json/get";

async function getOneUser(request: Request): Promise<{data: GetoneUserRouter, status: number}> {
    const response = await fetch(getEnv('GATEWAY_URL') + '/user/getone', {
        headers: {
            'cookie': request.headers.cookie || '',
            'browser-id': request.headers['browser-id']?.toString() || '',
            'visitor-id': request.headers['visitor-id']?.toString() || ''
        }
    });

    const json = await getJson(response);

    return ({
        data: json,
        status: response.status
    });
}

export default getOneUser;