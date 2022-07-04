import Command from "../Command.js";

export default class Off extends Command {
    static name = "off";
    static alias = ["off", "shutdown", "disconnect", "restart"];
    static description = "Redémarre le bot";

    static async call(message, phoenix) {
        await phoenix.bot.destroy();
        console.log("Phoenix disconnected.");
        process.exit(0);
    }
}
