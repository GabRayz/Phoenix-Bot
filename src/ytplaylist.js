let Command = require('../commands/command.js');
let Playlist = require('../commands/playlist');
const request = require('request');
let Config = {}
Config = require('../config.json')
const searchApi = require('youtube-search-api');
let key = Config.ytapikey;

module.exports = class YTplaylist {
    static async Enqueue(url) {
        let id = url.split('=')[1];
        let videos = await this.GetPlaylist(id);
        if(videos) {
            for (const video of videos) {
                Command.Play.addToQueueObject(video);
            }
        }
        console.log('Playlist enqueued !');
    }

    static async ImportPlaylist(url, playlistName, user) {
        console.log('Playlist name : ' + playlistName);
        let id = url.split('=')[1];
        let videos = await this.GetPlaylist(id);
        if(videos) {
            await this.AddToPL(videos, playlistName, user);
            console.log('Playlist imported !');
            Playlist.textChannel.send("Playlist importée !");
        }
    }

    static async AddToPL(videos, playlistName, user) {
        return new Promise(async resolve => {
            for(const element of videos) {
                let video = element;
                let res = await Playlist.add(video.name, playlistName, user, false, video.id);
                if(!res){
                    Playlist.textChannel.send("Oh, une erreur :/");
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

    static Get(url) {
        console.log('Send request');
        return new Promise(resolve => {
            request(url, (err, res, body) => {
                if(err) {
                    console.error(err);
                    return false;
                }
                body = JSON.parse(body);
                
                let videos = body.items.filter(vid => vid.snippet.title !== "Private video");
                let nextPageToken = (body.nextPageToken ? body.nextPageToken: false);
                resolve({"videos": videos, "nextPageToken": nextPageToken});
            })
        })
    }
}
