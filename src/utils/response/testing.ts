import { Express } from 'express';
import { testMode } from '@/utils/env/env';

function testing(app: Express) {
    if (testMode()) {
        app.get('/', (_, res) => res.send('server is working.'));
    }
}

export default testing;