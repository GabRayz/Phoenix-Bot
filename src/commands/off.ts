import Command from "../Command";
import logger from "../logger";

export default class Off extends Command {
    static commandName = "off";
    static alias = ["off", "shutdown", "disconnect", "restart"];
    static description = "Redémarre le bot";

    static async call(message, phoenix) {
        await phoenix.bot.destroy();
        logger.info("Phoenix disconnected.", { label: "BOT" });
        process.exit(0);
    }
}
