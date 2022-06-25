let Command = require('../src/Command');
let Play = require('./play');

module.exports = class Queue extends Command {
    static name = 'queue';
    static alias = [
        "queue"
    ]
    static description = "Affiche la liste d'attente des musiques.";

    static call(msg, phoenix) {
        let res = "Playlist en cours : " + (Play.currentPlaylistName === "" ? "Aucune": Play.currentPlaylistName);
        res += "\nFile d'attente : ";
        Play.queue.forEach(song => res += song.name + ", ");
        res += "\nÀ la fin de la file d'attente, des chansons de la playlist seront ajoutées";
        phoenix.sendClean(res, msg.channel, 20000);
    }
}
