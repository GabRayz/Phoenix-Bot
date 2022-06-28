let Command = require("../src/Command");
let ytdl = require("ytdl-core");
let ffmpeg = require("fluent-ffmpeg");

module.exports = class Download extends Command {
    static name = "download";
    static alias = ["download", "dl"];
    static description = "Télécharge une vidéo";

    // Usage: {prefix}download [{audio|video} [url]]

    static async call(message, phoenix) {
        // Get the url from which to download
        console.log(message);
        let phoenixGuild = phoenix.guilds[message.guildId];
        let url =
            message.args.length === 2 ? message.args[1] : this.getCurrentVideo(phoenixGuild);
        console.log(url);
        let audioonly = message.args.length >= 1 && message.args[0] === "audio";

        let stream = ytdl(url, {filter: (audioonly ? "audio" : "audioandvideo")});

        let msg = await message.channel.send("Le téléchargement va commencer.");
        console.log("Initiating video download...");
        this.download(msg, stream, audioonly, phoenix);
    }

    static download(msg, stream, audioOnly, phoenix) {
        let rand = Math.round(Math.random() * (1000000 + 100000) - 100000);
        let path = `public/${rand}.${audioOnly ? "mp3" : "mp4"}`;
        let kb = 0;
        let interval = setInterval(() => {
            msg.edit(kb / 1000 + " Mb downloaded");
        }, 2000);

        let cmd = ffmpeg(stream)
            .audioBitrate(123)
            .on("start", () => {
                console.log("Video download has started.");
                msg.channel.send("Téléchargement en cours...");
            })
            .on("progress", (p) => {
                kb = p.targetSize;
            })
            .on("error", (err) => {
                console.error(err);
                msg.channel.send("Erreur :/");
            })
            .on("end", () => {
                cmd.kill();
                clearInterval(interval);
                console.log("Download done !");
                msg.channel.send(
                    "Le fichier est disponible : " +
                    phoenix.config.downloadAdress +
                    ":" +
                    phoenix.config.downloadPort +
                    "/" + (audioOnly ? "mp3" : "mp4") + "/" + rand
                );
            })
            .save(path);
    }

    static getCurrentVideo(phoenixGuild) {
        return phoenixGuild.music.videoUrl;
    }
};
