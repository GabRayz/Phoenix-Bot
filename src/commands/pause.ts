import Command from "../Command.js";

export default class Pause extends Command {
    static commandName = "pause";
    static alias = ["pause"];
    static description = "Met la musique en pause";

    static call(message, phoenix) {
        const music = phoenix.guilds[message.guildId].music;
        music.pause();
    }
}
