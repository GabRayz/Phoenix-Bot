let Command = require('../src/Command');

module.exports = class Resume extends Command {
    static name = "resume";
    static alias = [
        "resume"
    ]
    static description = "Reprend la musique";

    static call(message, phoenix) {
        const music = phoenix.guilds[message.guildId].music;
        music.resume();
    }
}
