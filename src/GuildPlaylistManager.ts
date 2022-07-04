import logger from "./logger";

export default class GuildPlaylistManager {
    phoenixGuild: any = null;
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
        logger.debug("Playlist created", { label: "CREATE_PLAYLIST" });
    }

    list() {
        return Object.keys(this.playlists);
    }

    add(songName, playlistName, songId = "") {
        logger.debug(`Adding ${songName} to playlist ${playlistName}`, {
            label: "ADD_PLAYLIST",
        });
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

        const music = this.phoenixGuild?.music;
        music.currentPlaylist = this.playlists[playlistName].items;
        music.currentPlaylistName = playlistName;
        logger.debug(`Playing playlist: ${playlistName}`, {
            label: "PLAY_PLAYLIST",
        });

        music.start(msg);
    }

    stop() {
        const music = this.phoenixGuild?.music;
        music.currentPlaylist = [];
        music.currentPlaylistName = "";
    }

    delete(playlistName) {
        this.playlists[playlistName] = undefined;
    }
}
