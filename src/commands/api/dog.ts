import fetch from "node-fetch";
import { MessageEmbed } from "discord.js";
import Command from "../../Command.js";

export default class Dog extends Command {
    static commandName: string = "dog";
    static alias = ["dog", "doggo"];
    static description = "Affiche un chien aléatoirement";

    static async call(message, _phoenix) {
        const { url } = await fetch("https://random.dog/woof.json")
            .then((response) => response.json() as any)
            .catch((err) => console.error(err));

        const embed = new MessageEmbed()
            .setDescription("**Quel chien magnifique !**")
            .setColor(0x0ff0f0)
            .setImage(url)
            .setURL(url);

        message.channel.send({ embeds: [embed] }).catch((err) => {
            message.reply(`An error occured.`);
            console.error(err);
        });
    }
}
