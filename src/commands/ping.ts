import Command from "../Command";
import Phoenix from "../Phoenix";
import {Message} from "discord.js";

export default class Ping extends Command {

    static commandName = "ping";
    static alias = ["ping"];
    static description = "Pong !";

    static async call(message: Message, _args: string[], _phoenix: Phoenix) {
        return message.reply('Pong !')
    }
}