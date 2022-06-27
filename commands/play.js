let Command = require('../src/Command');
const {Playlist} = require("./command");

module.exports = class Play extends Command {
    static name = 'play';
    static alias = [
            "play"
        ];
    static description = "Ajoute une musique à la file d'attente. Démarre la lecture si aucune musique n'est en cours.";

    /**
     * Entry point of the command. Adds to song to the queue and start playing.
     * @param {*} message 
     * @param {*} phoenix
     */
    static async call(message, phoenix) {
        const music = phoenix.guilds[message.guildId].music;
        if(message.args.length > 0 && message.args[0].startsWith('http') && message.args[0].includes('playlist?list=')) {
            console.log('Importing playlist...');
            await Playlist.Enqueue(message.args[0]);
        }else {
            music.addToQueue(message);
        }
        await music.start(phoenix, message);
    }
}
