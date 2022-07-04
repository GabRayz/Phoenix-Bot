// Import packages
require("./src/http");
const Phoenix = require("./src/Phoenix");
const config = require("./config");

const Sentry = require("@sentry/node");
const Tracing = require("@sentry/tracing");
Sentry.init({
    dsn: config.SENTRY_DSN,
    tracesSampleRate: 1.0,
});

const transaction = Sentry.startTransaction({
    op: "phoenix",
    name: "Phoenix Bot Transaction",
});

RegExp.escape = function (s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
};

const phoenix = new Phoenix();

try {
    phoenix.loadConfig().then(async () => {
        await phoenix.login();
    });
} catch (e) {
    Sentry.captureException(e);
} finally {
    transaction.finish();
}


module.exports = phoenix;
