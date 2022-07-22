import fetch from "node-fetch";
import {Message, MessageEmbed} from "discord.js";
import Command from "../../Command";
import logger from "../../logger";
import Sentry from "@sentry/node";
import Phoenix from "../../Phoenix";

export default class Dog extends Command {
    static commandName: string = "dog";
    static alias = ["dog", "doggo"];
    static description = "Affiche un chien aléatoirement";

    static async call(message: Message, args: string[], _phoenix: Phoenix) {
        const { url } = await fetch("https://random.dog/woof.json")
            .then((response) => response.json() as any)
            .catch((err) => {
                logger.error(err, { label: "DOG" });
                Sentry.captureException(err);
            });

        const embed = new MessageEmbed()
            .setDescription("**Quel chien magnifique !**")
            .setColor(0x0ff0f0)
            .setImage(url)
            .setURL(url);

        message.channel.send({ embeds: [embed] }).catch((err) => {
            message.reply(`An error occured.`);
            logger.error(err, { label: "DOG" });
            Sentry.captureException(err);
        });
    }
}
