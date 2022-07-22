import Command from "../Command";
import logger from "../logger";
import {Message} from "discord.js";
import Phoenix from "../Phoenix";

export default class Timer extends Command {
    static commandName = "timer";
    static alias = ["timer"];
    static description = "Example for creating a command";

    static async call(message: Message, args: string[], phoenix: Phoenix) {
        if (args.length == 2) {
            let nb = parseInt(args[0]);
            this.setTimer(this.getUnit(args[1]) * nb, message);
        }
    }

    static setTimer(duration, message) {
        if (duration <= 0) return;
        logger.debug(`Timer set for ${message.author.username} : ${duration}`, {
            label: "TIMER_SET_TIMER",
        });
        message.react("🕐");
        setTimeout(() => {
            message.reply("Driiiiing !");
        }, duration);
    }

    static getUnit(unit) {
        switch (unit) {
            case "s":
                return 1000;
            case "m":
                return 1000 * 60;
            case "h":
                return 1000 * 60 * 60;
            default:
                return 1000;
        }
    }
}
