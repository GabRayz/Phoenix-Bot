import Command from "../../Command";
import { getMember } from "../../utils";

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
