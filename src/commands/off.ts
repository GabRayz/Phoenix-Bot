import Command from "../Command";
import logger from "../logger";
import {Message} from "discord.js";
import Phoenix from "../Phoenix";

export default class Off extends Command {
    static commandName = "off";
    static alias = ["off", "shutdown", "disconnect", "restart"];
    static description = "Redémarre le bot";

    static async call(message: Message, args: string[], phoenix: Phoenix) {
        await phoenix.bot.destroy();
        logger.info("Phoenix disconnected.", { label: "BOT" });
        process.exit(0);
    }
}
