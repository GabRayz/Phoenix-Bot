const Command = require("../../src/Command");
const { MessageEmbed, Guild } = require("discord.js");

module.exports = class BotInfo extends Command {
    static name = "botInfo";
    static alias = ["bot", "botinfo"];
    static description = "Affiche les informations du bot";

    static async call(message, phoenix) {
        const client = message.client;
        const time = (client.uptime / 1000).toFixed(0);
        const seconds = (time % 60).toFixed(0);
        const min = (time / 60).toFixed(0);
        const hours = (min / 60).toFixed(0);
        const days = (hours / 24).toFixed(0);

        const application = await client.application.fetch();

        const embed = new MessageEmbed()
            .setFooter({
                text: client.user.username,
                iconURL: message.member.displayAvatarURL(),
            })
            .setColor(0x00ff00)
            .setThumbnail(application.iconURL())
            .addField(
                "Creator",
                `${application.owner.username}#${application.owner.discriminator}}`,
                true
            )
            .addField("Servers", `${client.guilds.cache.size}`, true)
            .addField("User", `${client.users.cache.size}`, true)
            .addField("Uptime", `${days}d${hours % 24}h${min % 60}m${seconds}s`)
            .addField("ID", client.user.id)
            .addField(
                "User",
                `${client.user.username}#${client.user.discriminator}`,
                true
            )
            .setTimestamp();

        if (client.user.presence.game) {
            embed.addField("Currently playing", client.user.presence.game.name);
        }

        message.channel.send({ embeds: [embed] }).catch((err) => {
            message.reply(`An error occured.`);
            console.error(err);
        });
    }
};
