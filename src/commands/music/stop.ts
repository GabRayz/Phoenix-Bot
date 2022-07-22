import Command from "../../Command";
import {Message} from "discord.js";
import Phoenix from "../../Phoenix";

export default class Stop extends Command {
    static commandName = "stop";
    static alias = ["stop", "tg"];
    static description =
        "Arrete la musique et deconnecte le bot du salon vocal.";

    static async call(message: Message, args: string[], phoenix: Phoenix) {
        const music = phoenix.guilds.get(message.guildId!)!.music;
        music.stop();
    }
}
