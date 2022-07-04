import { MessageEmbed } from "discord.js";
import Command from "../../Command";
import Sentry from "@sentry/node";

export default class RoleInfo extends Command {
    static commandName = "roleInfo";
    static alias = ["role", "roleInfo"];
    static description = "Example for creating a command";

    static async call(message, Phoenix) {
        if (
            !message.args.length ||
            message.args.length > 1 ||
            !message.mentions.roles.size
        ) {
            return message.channel.send("Invalid use of the command");
        }

        const role = message.mentions.roles.first();
        const embed = new MessageEmbed()
            .setColor(0x00ff00)
            .addField("Name", `${role.name}`, true)
            .addField("ID", `${role.id}`, true)
            .addField("Server", `${role.guild.name}`, true)
            .addField("Color", `${role.hexColor}`, true)
            .addField("Members", `${role.members.size}`, true)
            .addField("Mentionable", `${role.mentionable}`, true)
            .addField("Created at", `${role.createdAt}`)
            .setTimestamp();

        message.channel.send({ embeds: [embed] }).catch((err) => {
            Sentry.captureException(err);
            message.reply(`An error occured.`);
            console.error(err);
        });
    }
}
