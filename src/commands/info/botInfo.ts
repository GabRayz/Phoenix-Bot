import Command from "../../Command";
import {Message, MessageEmbed} from "discord.js";
import logger from "../../logger";
import Sentry from "@sentry/node";
import Phoenix from "../../Phoenix";

export default class BotInfo extends Command {
    static commandName: string = "botInfo";
    static alias = ["bot", "botinfo"];
    static description = "Affiche les informations du bot";

    static async call(message: Message, _args: string[], _phoenix: Phoenix) {
        const client = message.client;
        if (client.application == null)
            return;
        const application = await client.application.fetch();
        if (client.user == null || message.member == null || application.owner == null || application.owner.client == null)
            return;
        const time = ((client.uptime ?? 0) / 1000).toFixed(0);
        const seconds = (+time % 60).toFixed(0);
        const min = (+time / 60).toFixed(0);
        const hours = (+min / 60).toFixed(0);
        const days = (+hours / 24).toFixed(0);

        const embed = new MessageEmbed()
            .setFooter({
                text: client.user.username,
                iconURL: message.member.displayAvatarURL(),
            })
            .setColor(0x00ff00)
            .addField(
                "Creator",
                `${application.owner.client.user!.tag}`,
                true
            )
            .addField("Servers", `${client.guilds.cache.size}`, true)
            .addField("User", `${client.users.cache.size}`, true)
            .addField(
                "Uptime",
                `${days}d${+hours % 24}h${+min % 60}m${seconds}s`
            )
            .addField("ID", client.user.id)
            .addField(
                "User",
                `${client.user.username}#${client.user.discriminator}`,
                true
            )
            .setTimestamp();

        let iconUrl = application.iconURL();
        if (iconUrl != null)
            embed.setThumbnail(iconUrl);

        message.channel.send({ embeds: [embed] }).catch((err) => {
            Sentry.captureException(err);
            message.reply(`An error occured.`);
            logger.error(err, { label: "BOT_INFO" });
        });
        throw new Error('Error test');
    }
}
