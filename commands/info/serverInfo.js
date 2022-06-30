const Command = require("../../src/Command");
const { MessageEmbed, Guild } = require("discord.js");

module.exports = class ServerInfo extends Command {
    static name = "serverInfo";
    static alias = ["server", "serverinfo"];
    static description = "Affiche les informations d'un serveur";

    static async call(message, phoenix) {
        const server = message.guild;

        const owner = await server.fetchOwner();

        const embed = new MessageEmbed()
            .setTimestamp()
            .setColor(0x00ff00)
            .setThumbnail(server.iconURL())
            .addField("Name", `${server.name}`, true)
            .addField(
                "Owner",
                `${owner.user.username}#${owner.user.discriminator}`,
                true
            )
            .addField("ID", `${server.id}`)
            .addField("Members", `${server.memberCount}`, true)
            .addField("Channels", `${server.channels.cache.size}`, true)
            .addField("Roles", `${server.roles.cache.size}`, true)
            .addField("Created at", `${server.createdAt}`);

        message.channel.send({ embeds: [embed] }).catch((err) => {
            message.reply(`An error occured.`);
            console.error(err);
        });
    }
};
