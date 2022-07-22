import Command from "../../Command";
import {Message} from "discord.js";
import Phoenix from "../../Phoenix";

export default class Queue extends Command {
    static commandName = "queue";
    static alias = ["queue"];
    static description = "Affiche la liste d'attente des musiques.";

    static async call(msg: Message, _args: string[], phoenix: Phoenix) {
        const music = phoenix.guilds.get(msg.guildId!)!.music;
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
