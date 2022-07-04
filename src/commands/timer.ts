import Command from "../Command";
import logger from "../logger";

export default class Timer extends Command {
    static commandName = "timer";
    static alias = ["timer"];
    static description = "Example for creating a command";

    static async call(message, _phoenix) {
        if (message.args.length == 2) {
            let nb = parseInt(message.args[0]);
            this.setTimer(this.getUnit(message.args[1]) * nb, message);
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
