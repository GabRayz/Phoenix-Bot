import Command from "../../Command";
import { getMember } from "../../utils";
import {Message} from "discord.js";
import Phoenix from "../../Phoenix";

export default class Avatar extends Command {
    static commandName = "avatar";
    static alias = ["avatar"];
    static description = "Show the avatar of a user";

    static async call(message: Message, args: string[], _phoenix: Phoenix) {
        const member = getMember(message, args.join(" "));

        if (!member) {
            return message.channel.send(
                "Could not find a user with that name."
            );
        }
        message.channel.send(member.displayAvatarURL());
    }
}
