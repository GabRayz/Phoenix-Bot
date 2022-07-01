import Command from "../Command.js";

export default class Skip extends Command {
    static name = "skip";
    static alias = ["skip", "next"];
    description = "Passer à la prochaine musique de la file d'attente";

    static call(message, phoenix) {
        const music = phoenix.guilds[message.guildId].music;
        music.skip();
    }
}
