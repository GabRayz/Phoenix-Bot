let Command = require("../src/Command");

module.exports = class Stop extends Command {
    static name = "stop";
    static alias = ["stop", "tg"];
    static description =
        "Arrete la musique et deconnecte le bot du salon vocal.";

    static call(message, phoenix) {
        const music = phoenix.guilds[message.guildId].music;
        music.stop();
    }
};
