import fetch from "node-fetch";
import { MessageEmbed } from "discord.js";
import Command from "../../Command.js";

export default class Cat extends Command {
    static name = "cat";
    static alias = ["cat", "kitty"];
    static description = "Affiche un chat aléatoirement";

    static async call(message, _phoenix) {
        const { file } = await fetch("https://aws.random.cat/meow")
            .then((response) => response.json())
            .catch((err) => console.error(err));

        const embed = new MessageEmbed()
            .setDescription("**Quel chat magnifique !**")
            .setColor(0x0ff0f0)
            .setImage(file)
            .setURL(file);

        message.channel.send({ embeds: [embed] }).catch((err) => {
            message.reply(`An error occured.`);
            console.error(err);
        });
    }
}
