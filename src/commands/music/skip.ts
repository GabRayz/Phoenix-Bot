import Command from "../../Command";

export default class Skip extends Command {
    static commandName = "skip";
    static alias = ["skip", "next"];
    description = "Passer à la prochaine musique de la file d'attente";

    static call(message, phoenix) {
        const music = phoenix.guilds[message.guildId].music;
        music.skip();
    }
}
