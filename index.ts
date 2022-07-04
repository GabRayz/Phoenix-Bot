// Import packages
import Sentry from "@sentry/node";
import("./src/http");
import Phoenix from "./src/Phoenix";
import config from "./config.json" assert { type: "json" };

Sentry.init({
    dsn: config.SENTRY_DSN,
    tracesSampleRate: 1.0,
});

const transaction = Sentry.startTransaction({
    name: "Phoenix",
    op: "phoenix",
});

const phoenix = new Phoenix();

(async () => {
    try {
        await phoenix.loadConfig();
        await phoenix.login();
    } catch (e) {
        Sentry.captureException(e);
    } finally {
        transaction.finish();
    }

})()

export default phoenix;
