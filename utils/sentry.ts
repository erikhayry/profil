import * as Sentry from '@sentry/browser';
const manifest = require('../manifest.json');

function run() {
    const VERSION = manifest.version;
    Sentry.init({ dsn: 'https://25806d610e264b83a4a363f1bca8cfe3@sentry.io/1873455' });
    Sentry.configureScope((scope: any) => {
        scope.setTag("version", VERSION);
    });
}

export default {
    run
}
