const Command = require("../../src/Command");
const { getMember, formatDate } = require("../../src/utils");
const { MessageEmbed } = require("discord.js");

module.exports = class UserInfo extends Command {
    static name = "userInfo";
    static alias = ["me", "userinfo"];
    static description = "Affiche les informations d'un utilisateur";

    static async call(message, _phoenix) {
        const member = getMember(message, message.args.join(" "));

        const joined = formatDate(member.joinedAt);
        const roles =
            member.roles.cache
                .filter((r) => r.id !== message.guild.id)
                .map((r) => r)
                .join(", ") || "none";

        const created = formatDate(member.user.createdAt);

        const embed = new MessageEmbed()
            .setFooter({
                text: member.displayName,
                iconURL: member.user.displayAvatarURL,
            })
            .setThumbnail(member.displayAvatarURL())
            .setColor(0x00ff00)
            .addField(
                "__Member Information__",
                `**Name** : ${member.displayName}\n**Joined the** : ${joined}\n**Roles**: ${roles}`,
                true
            )
            .addField(
                "__User Information__",
                `**ID** : ${member.user.id}\n**Username** : ${member.user.username}\n**Discord Tag** : ${member.user.tag}\n**Created the** : ${created}`
            )
            .setTimestamp();

        if (member.presence?.activities.length > 0) {
            embed.addField(
                "**Currently playing**",
                member.presence.activities[0].name
            );
        }

        message.channel.send({ embeds: [embed] }).catch((err) => {
            message.reply(`An error occured.`);
            console.error(err);
        });
    }
};
