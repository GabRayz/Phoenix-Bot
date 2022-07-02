import Command from "../Command.js";
import { MessageEmbed } from "discord.js";

export default class MusicInfo extends Command {
    static commandName = "musicInfo";
    static alias = ["musicinfo", "infos", "playingnow", "i", "pn"];
    static description = "Donne des infos sur la musique en cours";

    static async call(message, phoenix) {
        const music = phoenix.guilds[message.guildId].music;
        if (music.videoInfos) {
            if (music.videoInfos.player_response) {
                music.videoInfos.formats = null;
                let infos = music.videoInfos.player_response;
                let embed = new MessageEmbed();
                embed
                    .setTitle(infos.videoDetails.title)
                    .setDescription(
                        infos.videoDetails.shortDescription.slice(0, 200)
                    )
                    .addField(
                        "Durée",
                        this.timeFormat(infos.videoDetails.lengthSeconds)
                    )
                    .setAuthor(infos.videoDetails.author)
                    .setURL(music.videoUrl);
                await message.channel.send({ embeds: [embed] });
            }
            message.channel.send(music.videoUrl);
        } else {
            let embed = new MessageEmbed();
            embed
                .setDescription("Aucune musique n'est jouée pour l'instant")
                .setColor("RED");

            message.channel.send({ embeds: [embed] }).catch((err) => {
                if (err.message == "Missing Permissions") {
                    message.channel.send(
                        "Aucune musique n'est jouée pour l'instant"
                    );
                } else {
                    console.error(err);
                }
            });
        }
    }

    static timeFormat(raw) {
        let s = raw % 60;
        let m = Math.floor(raw / 60);
        let h = Math.floor(m / 60);
        m = m % 60;
        return (h > 0 ? h + ":" : "") + (m > 0 ? m + ":" : "") + s;
    }
}
