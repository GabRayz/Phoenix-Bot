import Command from "../../Command";
import GetPlaylist from "../../YoutubePlaylists";
import logger from "../../logger";

export default class Play extends Command {
    static commandName = "play";
    static alias = ["play"];
    static description =
        "Ajoute une musique à la file d'attente. Démarre la lecture si aucune musique n'est en cours.";
    static volume;
    static voiceHandler;

    /**
     * Entry point of the command. Adds to song to the queue and start playing.
     * @param {*} message
     * @param {*} phoenix
     */
    static async call(message, phoenix) {
        const music = phoenix.guilds[message.guildId].music;
        if (
            message.args.length > 0 &&
            message.args[0].startsWith("http") &&
            message.args[0].includes("playlist?list=")
        ) {
            logger.debug("Importing playlist...", {
                label: "PLAY",
            });
            await this.enqueueYoutubePlaylist(message.args[0], music);
        } else {
            music.addToQueue(message);
        }
        await music.start(message);
    }

    static async enqueueYoutubePlaylist(url, music) {
        let id = url.split("=")[1];
        let videos = await GetPlaylist(id);
        for (const video of videos) {
            music.addToQueueObject(video);
        }
        logger.debug("Playlist enqueued !", { label: "PLAY_ENQUEUE_PLAYLIST" });
    }
}