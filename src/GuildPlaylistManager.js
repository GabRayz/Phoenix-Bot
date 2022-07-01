import fs from "fs";
import searchApi from "youtube-search-api";

export default class GuildPlaylistManager {
    phoenixGuild = null;
    playlists = {};

    constructor(phoenixGuild, playlists) {
        this.phoenixGuild = phoenixGuild;
        this.playlists = playlists;
    }

    create(name) {
        name = name.split(".")[0];
        if (this.playlists[name] !== undefined)
            throw new Error("This playlist name is already in use");
        this.playlists[name] = { items: [] };
        console.log("Playlist created");
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
            id: songId,
        };
        this.playlists[playlistName].items.push(music);
    }

    play(playlistName, msg) {
        if (this.playlists[playlistName] === undefined)
            throw new Error("This playlist does not exist");

        const music = this.phoenixGuild.music;
        music.currentPlaylist = this.playlists[playlistName].items;
        music.currentPlaylistName = playlistName;
        console.log("Playing playlist: " + playlistName);

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
}
