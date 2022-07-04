// Import packages
import Sentry from "@sentry/node";
import Tracing from "@sentry/tracing";
import("./src/http");
import Phoenix from "./src/Phoenix";
import config from "./config.json" assert { type: "json" };

Sentry.init({
    dsn: config.SENTRY_DSN,
    tracesSampleRate: 1.0,
});

const phoenix = new Phoenix();

try {
    phoenix.loadConfig().then(async () => {
        await phoenix.login();
    });
} catch (e) {
    Sentry.captureException(e);
}

export default phoenix;
