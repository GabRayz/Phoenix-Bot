let Command = require("../src/Command");

module.exports = class Pause extends Command {
    static name = "pause";
    static alias = ["pause"];
    static description = "Met la musique en pause";

    static call(message, phoenix) {
        const music = phoenix.guilds[message.guildId].music;
        music.pause();
    }
};
