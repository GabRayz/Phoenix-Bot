import Command from "../../Command";
import {Message, MessageEmbed} from "discord.js";
import { getMember, formatDate } from "../../utils";
import logger from "../../logger";
import Sentry from "@sentry/node";
import Phoenix from "../../Phoenix";

export default class UserInfo extends Command {
    static commandName: string = "userInfo";
    static alias = ["me", "userinfo"];
    static description = "Affiche les informations d'un utilisateur";

    static async call(message: Message, args: string[], phoenix: Phoenix) {
        if (message.guild == null)
            return;
        const member = getMember(message, args.join(" "));

        const joined = formatDate(member.joinedAt);
        const roles =
            member.roles.cache
                .filter((r) => r.id !== message.guild!.id)
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
            Sentry.captureException(err);
            message.reply(`An error occured.`);
            logger.error(err, { label: "USER_INFO" });
        });
    }
}
