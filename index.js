// Import packages
require("./src/http");
const Phoenix = require("./src/Phoenix");

RegExp.escape = function (s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
};

const phoenix = new Phoenix();

phoenix.loadConfig().then(async () => {
    await phoenix.login();
});

module.exports = phoenix;
