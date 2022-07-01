import Command from "../Command.js";

export default class Queue extends Command {
    static name = "queue";
    static alias = ["queue"];
    static description = "Affiche la liste d'attente des musiques.";

    static call(msg, phoenix) {
        const music = phoenix.guilds[msg.guildId].music;
        let res =
            "Playlist en cours : " +
            (music.currentPlaylistName === ""
                ? "Aucune"
                : music.currentPlaylistName);
        res += "\nFile d'attente : ";
        music.queue.forEach((song) => (res += song.name + ", "));
        res +=
            "\nÀ la fin de la file d'attente, des chansons de la playlist seront ajoutées";
        phoenix.sendClean(res, msg.channel, 20000);
    }
}
