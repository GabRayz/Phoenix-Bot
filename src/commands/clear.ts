import Command from "../Command";
import logger from "../logger";
import Sentry from "@sentry/node";
import {Message} from "discord.js";
import Phoenix from "../Phoenix";

export default class Clear extends Command {
    static commandName: string = "clear";
    static alias = ["clear", "clean"];
    static description = "Nettoie le chat des commandes bot";

    static async call(message: Message, _args: string[], phoenix: Phoenix) {
        let allMessage = await message.channel.messages.fetch();
        const prefix = phoenix.guilds.get(message.guildId!)!.config.prefix;
        let botMessages = allMessage.filter(
            (msg) =>
                msg.author.id === phoenix.bot.user!.id ||
                msg.content.startsWith(prefix)
        );
        for (let msg of botMessages) {
            msg[1].delete().catch((err) => {
                logger.error(err, { label: "CLEAR" });
                Sentry.captureException(err);
            });
        }
    }

    static sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
