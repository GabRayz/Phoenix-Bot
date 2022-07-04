// Import packages
import("./src/http");
import mongoose from "mongoose";
import Sentry from "@sentry/node";
import Phoenix from "./src/Phoenix";
import User from "./src/models/user";
import config from "./config.json" assert { type: "json" };
import "dotenv/config";

Sentry.init({
    dsn: config.SENTRY_DSN,
    tracesSampleRate: 1.0,
});

const phoenix = new Phoenix();

try {
    phoenix.loadConfig().then(async () => {
        await phoenix.login();

        mongoose.connect(
            `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}`
        );

        await Promise.all(
            phoenix.bot.users.cache.map(async (user) => {
                let userData = new User({
                    _id: user.id,
                    username: user.username,
                    scores: [],
                });
                return await User.findOneAndUpdate(
                    { _id: user.id },
                    { $setOnInsert: userData },
                    { upsert: true }
                ).exec();
            })
        );
    });
} catch (e) {
    Sentry.captureException(e);
}

export default phoenix;
