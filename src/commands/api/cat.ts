import fetch from "node-fetch";
import {Message, MessageEmbed} from "discord.js";
import Command from "../../Command";
import logger from "../../logger";
import Sentry from "@sentry/node";
import Phoenix from "../../Phoenix";

export default class Cat extends Command {
    static commandName = "cat";
    static alias = ["cat", "kitty"];
    static description = "Affiche un chat aléatoirement";

    static async call(message: Message, args: string[], _phoenix: Phoenix) {
        const { file } = await fetch("https://aws.random.cat/meow")
            .then((response) => response.json() as any)
            .catch((err) => {
                logger.error(err, { label: "CAT" });
                Sentry.captureException(err);
            });

        const embed = new MessageEmbed()
            .setDescription("**Quel chat magnifique !**")
            .setColor(0x0ff0f0)
            .setImage(file)
            .setURL(file);

        message.channel.send({ embeds: [embed] }).catch((err) => {
            message.reply(`An error occured.`);
            logger.error(err, { label: "CAT" });
            Sentry.captureException(err);
        });
    }
}
