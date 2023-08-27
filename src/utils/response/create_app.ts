import express from 'express';
import { isUndefined } from '../utils';

function createApp() {
    const app = express();

    app.response.return = function (data, message) {
        if (!isUndefined(message)) {
            for (let field in message) {
                if (!isUndefined(message[field as keyof ResponseMessage])) {
                    this.setHeader(field, message[field as keyof ResponseMessage]!);
                }
            }
        }

        this
            .status((message && message['status']) || 200)
            .send(typeof data === 'number' ? data.toString() : data);

        return;
    }


    return app;
}

export default createApp;