import Command from "../../Command";
import {Message} from "discord.js";
import Phoenix from "../../Phoenix";

export default class Pause extends Command {
    static commandName = "pause";
    static alias = ["pause"];
    static description = "Met la musique en pause";

    static async call(message: Message, _args: string[], phoenix: Phoenix) {
        const music = phoenix.guilds.get(message.guildId!)!.music;
        music.pause();
    }
}
