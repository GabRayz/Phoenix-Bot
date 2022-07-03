import Command from "../../Command.js";
import { getMember } from "../../utils.js";

export default class Avatar extends Command {
    static commandName = "avatar";
    static alias = ["avatar"];
    static description = "Show the avatar of a user";

    static async call(message, Phoenix) {
        const member = getMember(message, message.args.join(" "));

        if (!member) {
            return message.channel.send(
                "Could not find a user with that name."
            );
        }
        message.channel.send(member.displayAvatarURL());
    }
}
