import Command from "../../Command";
import {Message} from "discord.js";
import Phoenix from "../../Phoenix";

export default class Skip extends Command {
    static commandName = "skip";
    static alias = ["skip", "next"];
    description = "Passer à la prochaine musique de la file d'attente";

    static async call(message: Message, args: string[], phoenix: Phoenix) {
        const music = phoenix.guilds.get(message.guildId!)!.music;
        music.skip();
    }
}
