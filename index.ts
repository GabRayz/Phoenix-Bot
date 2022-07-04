// Import packages
import("./src/http");
import Phoenix from "./src/Phoenix";

const phoenix = new Phoenix();

phoenix.loadConfig().then(async () => {
    await phoenix.login();
});

export default phoenix;
