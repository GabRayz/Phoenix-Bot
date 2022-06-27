const fs = require('fs');
let Command = require('../src/Command');
let Play = require('./play');
const searchApi = require("youtube-search-api");

module.exports = class Playlist extends Command {
    static name = "playlist";
    static alias = [
        "playlist",
        "pl"
    ]
    static description = "Gérer les playlist. !playlist help";

    constructor(phoenix, channel) {
        super(phoenix, channel);
    }

    static call(msg, phoenix) {
        const instance = new Playlist(phoenix, msg.channel);
        switch(msg.args[0]) {
            case "create":
                if (msg.args.length > 1)
                    instance.create(msg.args[1], msg.author);
                break;
            case "list":
                instance.list();
                break;
            case "add":
                if (msg.args.length > 2) {
                    if(msg.args[2].includes('playlist?list=')) {
                        instance.importPlaylist(msg.args[2], msg.args[1], msg.author);
                    }else {
                        instance.add(this.getSoungName(msg.args), msg.args[1], msg.author);
                    }
                }
                break;
            case "play":
                if (msg.args.length > 1)
                    instance.play(msg.args[1], msg);
                msg.react('✅');
                break;
            case "stop":
                instance.stop();
                break;
            case "delete":
                if (msg.args.length > 1)
                    instance.delete(msg.args[1], msg.author);
                break;
            case "help":
                instance.showHelp();
                break
            case "see":
                if (msg.args.length > 1)
                    instance.see(msg.args[1]);
                break;
            default:
                return;
        }
    }

    create(name, user) {
        name = name.split('.')[0];
        let content = '{"authors": ["' + user.username + '"], "items": []}';
        fs.writeFile('playlists/' + name + '.json', content, (err) => {
            if (err === null) {
                console.log('Playlist created');
                this.channel.send('La playlist ' + name + ' a été créée.');
            }else {
                console.log(err);
                this.channel.send('Erreur lors de la création de la playlist');
            }
        })
    }

    list() {
        fs.readdir('playlists/', (err, files) => {
            if(err) {
                console.error(err);
                return;
            }
            let msg = "";
            if (files.length === 0) {
                msg = "Il n'y a aucune playlist";
            }else {
                msg = "Playlists: ";
                files.forEach(file => {
                    msg += "\n - " + file.split('.')[0];
                });
            }
            this.channel.send(msg);
        })
    }

    static getSoungName(args) {
        let res = "";
        for (let i = 2; i < args.length; i++) {
            const word = args[i];
            res += word + " ";
        }
        return res;
    }

    add(songName, playlistName, user, log = true, songId = "") {
        return new Promise(resolve => {
            console.log("Adding " + songName + " to playlist " + playlistName);
            let playlist = {};
            try {
                playlist = require('../playlists/' + playlistName + '.json');
            }catch (err) {
                if(log)
                    this.phoenix.sendClean('Cette playlist n\'existe pas :/', this.channel, 20000)
                console.log("Cannot find playlist " + playlistName);
                console.error(err);
                resolve(false);
            }

            if(!this.checkAuthors(playlist, user)) resolve(false);

            let music = {
                name: songName,
                id: songId
            }
            playlist.items.push(music)
            let text = JSON.stringify(playlist);
            fs.writeFile("playlists/" + playlistName + ".json", text, (err) => {
                if(err) {
                    console.error(err)
                    resolve(false);
                }else {
                    if(log)
                        this.phoenix.sendClean("Musique ajoutée à la playlist", this.channel, 10000);
                    console.log('Music added to playlist');
                    resolve(true);
                }
            });
        })
        
    }

    play(playlistName, msg) {
        let playlist = [];
        try {
            playlist = require('../playlists/' + playlistName + '.json');
        }catch {
            console.error('Playlist not found: ' + playlistName);
            this.phoenix.sendClean("Je n'ai pas trouvé cette playlist.", this.channel, 15000);
            return;
        }
        require('./play').currentPlaylist = playlist.items;
        require('./play').currentPlaylistName = playlistName;
        console.log('Playing playlist: ' + playlistName);

        require('./play').start(this.phoenix, msg);
    }

    stop() {
        require('./play').currentPlaylist = [];
        require('./play').currentPlaylistName = "";
    }

    delete(playlistName, user) {
        let playlist = {};
        try {
            playlist = require("../playlists/" + playlistName + ".json")
        }catch(err) {
            console.error(err);
            this.phoenix.sendClean("Je n'ai pas trouvé cette playlist", this.channel, 5000);
            return;
        }

        if(!this.checkAuthors(playlist, user)) return false;

        fs.unlink("playlists/" + playlistName + ".json", (err) => {
            if (err) {
                console.error(err);
                this.phoenix.sendClean("Je n'ai pas trouvé cette playlist", this.channel, 5000);
            }else {
                console.log('Deleted playlist: ' + playlistName);
                this.phoenix.sendClean("Playlist supprimée.", this.channel, 15000);
            }
        })
    }

    showHelp() {
        let prefix = this.phoenix.guilds[this.guild.id].config.prefix;
        let msg = "Gestion de playlist : " +
            "\n" + prefix + "playlist list: Liste toutes les playlist" +
            "\n" + prefix + "playlist create {nom}: Créer une nouvelle playlist" +
            "\n" + prefix + "playlist add {playlist} {nom}: Ajouter une musique à une playlist" +
            "\n" + prefix + "playlist play {playlist}: Joue une playlist" +
            "\n" + prefix + "playlist delete {playlist}: Supprime une playlist" +
            "\n" + prefix + "playlist see {playlist}: Liste le contenu d'une playlist" +
            "";
        this.channel.send(msg, {code: true});
    }

    checkAuthors(playlist, user) {
        if(playlist.authors.includes(user.username)) return true;
        this.phoenix.sendClean("Tu n'es pas l'auteur de cette playlist", this.channel, 15000);
        return false;
    }

    see(playlistName) {
        let playlist = {};
        try {
            playlist = require('../playlists/' + playlistName + '.json');
        }catch(err) {
            console.error(err);
            return;
        }
        let msgs = [];
        let msg = playlistName + ": playlist de " + playlist.authors[0] + " | ";
        playlist.items.forEach(song => {
            if (song.name)
                msg += song.name + ", ";
            else
                msg += song + ", ";
            if(msg.length > 1700) {
                msgs.push(msg);
                msg = "";
            }
        });
        msgs.push(msg);
        msgs.forEach(m => this.channel.send(m));
    }

    static async Enqueue(url) {
        let id = url.split('=')[1];
        let videos = await Playlist.GetPlaylist(id);
        if(videos) {
            for (const video of videos) {
                require('./play').addToQueueObject(video);
            }
        }
        console.log('Playlist enqueued !');
    }

    async importPlaylist(url, playlistName, user) {
        console.log('Playlist name : ' + playlistName);
        let id = url.split('=')[1];
        let videos = await Playlist.GetPlaylist(id);
        if(videos) {
            await this.addToPL(videos, playlistName, user);
            console.log('Playlist imported !');
            this.channel.send("Playlist importée !");
        }
    }

    async addToPL(videos, playlistName, user) {
        return new Promise(async resolve => {
            for(const element of videos) {
                let video = element;
                let res = await this.add(video.name, playlistName, user, false, video.id);
                if(!res){
                    this.channel.send("Oh, une erreur :/");
                }
            }
            resolve(true);
        })

    }

    static async GetPlaylist(id) {
        const result = await searchApi.GetPlaylistData(id, 100);
        return result.items.map(item => {
            return {
                name: item.title,
                id: item.id
            };
        });
    }
}
