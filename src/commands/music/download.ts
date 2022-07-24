import Command from "../../Command";
import { promises } from "fs";
import ytdl from "ytdl-core";
import ffmpeg from "fluent-ffmpeg";
import logger from "../../logger";
import {Message} from "discord.js";
import Phoenix from "../../Phoenix";

export default class Download extends Command {
    static commandName = "download";
    static alias = ["download", "dl"];
    static description = "Télécharge une vidéo";

    // Usage: {prefix}download [{audio|video} [url]]

    static async call(message: Message, args: string[], phoenix: Phoenix) {
        // Get the url from which to download
        if (message.guild == null)
            return
        logger.debug(message.content, { label: "DOWNLOAD" });
        let phoenixGuild = phoenix.guilds.get(message.guildId!);
        let url = args.length === 2
                ? args[1]
                : this.getCurrentVideo(phoenixGuild);
        logger.debug(url, { label: "DOWNLOAD" });
        let audioonly = args.length >= 1 && args[0] === "audio";

        let stream = ytdl(url, {
            filter: audioonly ? "audio" : "audioandvideo",
        });

        let msg = await message.channel.send("Le téléchargement va commencer.");
        logger.debug("Initiating video download...", { label: "DOWNLOAD" });
        this.download(msg, stream, audioonly, phoenix);
    }

    static download(msg, stream, audioOnly, phoenix) {
        let rand = Math.round(Math.random() * (1000000 - 100000) + 100000);
        let path = `public/${rand}.${audioOnly ? "mp3" : "mp4"}`;
        let kb = 0;
        let interval = setInterval(() => {
            msg.edit(kb / 1000 + " Mb downloaded");
        }, 2000);

        let cmd = ffmpeg(stream)
            .audioBitrate(123)
            .on("start", () => {
                logger.debug("Video download has started.", {
                    label: "DOWNLOAD",
                });
                msg.channel.send("Téléchargement en cours...");
            })
            .on("progress", (p) => {
                kb = p.targetSize;
            })
            .on("error", (err) => {
                logger.error(err, { label: "DOWNLOAD" });
                msg.channel.send("Erreur :/");
            })
            .on("end", () => {
                cmd.kill();
                clearInterval(interval);
                logger.debug("Download done !", { label: "DOWNLOAD" });
                msg.channel.send(
                    "Le fichier est disponible, et expirera dans 5 minutes : " +
                        phoenix.config.downloadAdress +
                        ":" +
                        phoenix.config.downloadPort +
                        "/" +
                        (audioOnly ? "mp3" : "mp4") +
                        "/" +
                        rand
                );
                setTimeout(() => promises.unlink(path), 1000 * 60 * 5);
            })
            .save(path);
    }

    static getCurrentVideo(phoenixGuild) {
        return phoenixGuild.music.videoUrl;
    }
}
