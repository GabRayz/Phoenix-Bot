// Import packages
import("./http.js");
import Phoenix from "./Phoenix.js";

// RegExp.escape = function (s) {
//     return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
// };

const phoenix = new Phoenix();

phoenix.loadConfig().then(async () => {
    await phoenix.login();
});

export default phoenix;
