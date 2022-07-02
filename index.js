// Import packages
require("./src/http");
const Phoenix = require("./src/Phoenix");

const Sentry = require("@sentry/node");
const Tracing = require("@sentry/tracing");
Sentry.init({
    dsn: "https://c6553244713742d693519319a55718ba@o1287280.ingest.sentry.io/6545421",
    tracesSampleRate: 1.0,
});

const transaction = Sentry.startTransaction({
    op: "phoenix",
    name: "Phoenix Bot Transaction",
});

RegExp.escape = function (s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
};

try {
    const phoenix = new Phoenix();

    phoenix.loadConfig().then(async () => {
        await phoenix.login();
    });
} catch (e) {
    Sentry.captureException(e);
} finally {
    transaction.finish();
}


module.exports = phoenix;
