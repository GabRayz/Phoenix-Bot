const fs = require("fs");
const searchApi = require("youtube-search-api");

module.exports = class GuildPlaylistManager {
    phoenixGuild = null;
    playlists = {};

    constructor(phoenixGuild, playlists) {
        this.phoenixGuild = phoenixGuild;
        this.playlists = playlists;
    }

    create(name) {
        name = name.split('.')[0];
        if (this.playlists[name] !== undefined)
            throw new Error("This playlist name is already in use")
        this.playlists[name] = {items: []};
        console.log('Playlist created');
    }

    list() {
        return Object.keys(this.playlists);
    }

    add(songName, playlistName, songId = "") {
        console.log("Adding " + songName + " to playlist " + playlistName);
        if (this.playlists[playlistName] === undefined)
            throw new Error("This playlist does not exist");

        let music = {
            name: songName,
            id: songId
        }
        this.playlists[playlistName].items.push(music);
    }

    play(playlistName, msg) {
        if (this.playlists[playlistName] === undefined)
            throw new Error("This playlist does not exist");

        const music = this.phoenixGuild.music;
        music.currentPlaylist = this.playlists[playlistName].items;
        music.currentPlaylistName = playlistName;
        console.log('Playing playlist: ' + playlistName);

        music.start(msg);
    }

    stop() {
        const music = this.phoenixGuild.music;
        music.currentPlaylist = [];
        music.currentPlaylistName = "";
    }

    delete(playlistName) {
        this.playlists[playlistName] = undefined;
    }

    async Enqueue(url) {
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

    async GetPlaylist(id) {
        const result = await searchApi.GetPlaylistData(id, 100);
        return result.items.map(item => {
            return {
                name: item.title,
                id: item.id
            };
        });
    }
}