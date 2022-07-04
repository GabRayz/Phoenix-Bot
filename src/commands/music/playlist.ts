import Command from "../../Command";
import GetPlaylist from "../../YoutubePlaylists";
import logger from "../../logger";
import Sentry from "@sentry/node";

export default class Playlist extends Command {
    static commandName = "playlist";
    static alias = ["playlist", "pl"];
    static description = "Gérer les playlist. !playlist help";

    constructor(phoenix, channel) {
        super(phoenix, channel);
    }

    static call(msg, phoenix) {
        let phoenixGuild = phoenix.guilds[msg.guildId];
        const manager = phoenixGuild.playlistManager;
        switch (msg.args[0]) {
            case "create":
                if (msg.args.length > 1) {
                    try {
                        manager.create(msg.args[1], msg.author);
                        phoenixGuild.saveConfig().then(() => msg.react("✅"));
                    } catch (e) {
                        Sentry.captureException(e);
                        msg.reply(e);
                    }
                }
                break;
            case "list":
                this.list(msg.channel, manager);
                break;
            case "add":
                if (msg.args.length > 2) {
                    if (msg.args[2].includes("playlist?list=")) {
                        this.importYoutubePlaylist(
                            msg.args[2],
                            msg.args[1],
                            manager
                        ).then(() => {
                            msg.react("✅");
                            logger.debug("Playlist imported !", {
                                label: "PLAYLIST",
                            });
                        });
                    } else {
                        try {
                            manager.add(
                                this.getSongName(msg.args),
                                msg.args[1]
                            );
                            phoenixGuild
                                .saveConfig()
                                .then(() => msg.react("✅"));
                        } catch (e) {
                            Sentry.captureException(e);
                            phoenix.sendClean(e, msg.channel);
                        }
                    }
                }
                break;
            case "play":
                if (msg.args.length > 1) {
                    try {
                        manager.play(msg.args[1], msg);
                        msg.react("✅");
                    } catch (e) {
                        Sentry.captureException(e);
                        phoenix.sendClean(e, msg.channel);
                    }
                }
                msg.react("✅");
                break;
            case "stop":
                manager.stop();
                break;
            case "delete":
                if (msg.args.length > 1) {
                    manager.delete(msg.args[1]);
                    phoenixGuild.saveConfig().then(() => msg.react("✅"));
                }
                break;
            case "help":
                Playlist.showHelp(msg.channel, phoenixGuild);
                break;
            case "see":
                if (msg.args.length > 1)
                    this.see(phoenixGuild, msg.args[1], msg.channel);
                break;
            default:
                return;
        }
    }

    static getSongName(args) {
        let res = "";
        for (let i = 2; i < args.length; i++) {
            const word = args[i];
            res += word + " ";
        }
        return res;
    }

    static list(channel, manager) {
        const names = manager.list();

        let msg;
        if (names.length === 0) {
            msg = "Il n'y a aucune playlist";
        } else {
            msg = "Playlists: ";
            msg += names.map((name) => "\n - " + name).join();
        }
        channel.send(msg);
    }

    static showHelp(channel, phoenixGuild) {
        let prefix = phoenixGuild.config.prefix;
        let msg =
            "Gestion de playlist : " +
            "\n" +
            prefix +
            "playlist list: Liste toutes les playlist" +
            "\n" +
            prefix +
            "playlist create {nom}: Créer une nouvelle playlist" +
            "\n" +
            prefix +
            "playlist add {playlist} {nom}: Ajouter une musique à une playlist" +
            "\n" +
            prefix +
            "playlist play {playlist}: Joue une playlist" +
            "\n" +
            prefix +
            "playlist delete {playlist}: Supprime une playlist" +
            "\n" +
            prefix +
            "playlist see {playlist}: Liste le contenu d'une playlist" +
            "";
        channel.send(msg, { code: true });
    }

    static see(phoenixGuild, playlistName, channel) {
        let playlist = phoenixGuild.playlistManager.playlists[playlistName];
        let msgs: any[] = [];
        let msg = playlistName + " : ";
        playlist.items.forEach((song) => {
            if (song.name) msg += song.name + ", ";
            else msg += song + ", ";
            if (msg.length > 1700) {
                msgs.push(msg);
                msg = "";
            }
        });
        msgs.push(msg);
        msgs.forEach((m) => channel.send(m));
    }

    static async importYoutubePlaylist(url, playlistName, manager) {
        logger.debug(`Playlist name : ${playlistName}`, {
            label: "PLAYLIST_IMPORT_YOUTUBE_PLAYLIST",
        });
        let id = url.split("=")[1];
        let videos = await GetPlaylist(id);
        for (const video of videos) {
            await manager.add(video.name, playlistName, video.id);
        }
    }
}
