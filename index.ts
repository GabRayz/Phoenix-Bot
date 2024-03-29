// Import packages
import Sentry from "@sentry/node";
import("./src/http");
import Phoenix from "./src/Phoenix";
import config from "./config/config.json" assert { type: "json" };

Sentry.init({
    dsn: config.SENTRY_DSN,
    tracesSampleRate: 1.0,
});

const phoenix = Phoenix.init();

(async () => {
    try {
        await phoenix.login();
    } catch (e) {
        Sentry.captureException(e);
    }

})()

export default phoenix;
