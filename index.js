// Import packages
require("./src/http");
const Phoenix = require("./src/Phoenix");

const mongoose = require("mongoose");
const User = require("./src/models/user");

RegExp.escape = function (s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
};

const phoenix = new Phoenix();

phoenix.loadConfig().then(async () => {
    await phoenix.login();

    mongoose.connect("mongodb://localhost:27017/Phoenix");

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

module.exports = phoenix;
