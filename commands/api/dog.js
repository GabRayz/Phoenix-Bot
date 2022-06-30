const fetch = require("node-fetch");
const { MessageEmbed } = require("discord.js");
const Command = require("../../src/Command");

module.exports = class Dog extends Command {
    static name = "dog";
    static alias = ["dog", "doggo"];
    static description = "Affiche un chien aléatoirement";

    static async call(message, phoenix) {
        const { url } = await fetch("https://random.dog/woof.json")
            .then((response) => response.json())
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
};
