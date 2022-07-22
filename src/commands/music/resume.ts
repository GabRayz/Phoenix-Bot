import Command from "../../Command";
import {Message} from "discord.js";
import Phoenix from "../../Phoenix";

export default class Resume extends Command {
    static commandName = "resume";
    static alias = ["resume"];
    static description = "Reprend la musique";

    static async call(message: Message, _args: string[], phoenix: Phoenix) {
        const music = phoenix.guilds.get(message.guildId!)!.music;
        music.resume();
    }
}
