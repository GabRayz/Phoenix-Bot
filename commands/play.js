const youtube = require('ytdl-core');
const YTplaylist = require('../src/ytplaylist');
const voice = require('@discordjs/voice');
const searchApi = require('youtube-search-api');

let Phoenix = require('../index');

let Command = require('../src/Command');

module.exports = class Play extends Command {
    static name = 'play';
    static alias = [
            "play"
        ];
    static description = "Ajoute une musique à la file d'attente. Démarre la lecture si aucune musique n'est en cours.";
    /**
     * List of songs to be played, represented by a name or a url
     */
    static queue = [];
    /**
     * Defines if the bot is currently playing music.
     */
    static isPlaying = false;
    /**
     * List of songs of the current playlist.
     */
    static currentPlaylist = [];
    /**
     * Name of the current playlist
     */
    static currentPlaylistName = "";
    static volume = 1;

    /**
     * Infos on the currently playing video.
     */
    static videoInfos = null;
    static videoUrl = null;
    static audioPlayer = null;

    /**
     * Entry point of the command. Adds to song to the queue and start playing.
     * @param {*} message 
     * @param {*} phoenix
     */
    static async call(message, phoenix) {
        this.textChannel = message.channel;
        this.phoenix = phoenix;

        if(message.args.length > 0 && message.args[0].startsWith('http') && message.args[0].includes('playlist?list=')) {
            console.log('Importing playlist...');
            await YTplaylist.Enqueue(message.args[0]);
        }else {
            this.addToQueue(message);
        }
        await this.start(phoenix, message);
    }

    /**
     * Joins a voice channel and calls this.nextSong() to start playing.
     * @param {*} phoenix
     * @param {*} message 
     */
    static async start(phoenix, message) {
        this.phoenix = phoenix;
        // Do nothing if the voice is already started
        if(!this.isPlaying) {
            console.log("connecting to voice channel");
            this.textChannel = message.channel;
            this.connectToVoiceChannel(message.member.voice.channel).then(() => {
                console.log("Connected to voice channel", message.member.voice.channel.name);
                this.nextSong();
            }).catch(() => {
                this.textChannel.send("Tu n'es pas connecté à un channel vocal ='(");
                console.log('User not connected to a voice channel');
            })
        }
    }

    static addToQueue(message) {
        let name = "";
        message.args.forEach(str => {
            name += str + " ";
        });
        console.log("Queueing: " + name);
        this.queue.push({
            name: name,
            id: null
        });
        message.react('✅');
    }

    static addToQueueObject(video) {
        console.log("Queueing: " + video.name);
        this.queue.push(video);
    }

    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static async nextSong() {
        await this.sleep(200);
        // If it this the first song to be played, add an activity to Phoenix
        if (!this.isPlaying)
            Phoenix.activities++;
        
        console.log('Choosing next song...');
        if(!this.queue.length > 0) {
            if(this.currentPlaylist.length > 0) {
                this.checkPlaylist();
            }else {
                return;
            }
        }
        let song = this.queue.shift();
        console.log('Next song: ', song.name);

        // Get video url
        let url = await this.getUrlFromQuery(song).catch(err => {
            if (err instanceof TypeError)
            {
                console.error(err);
                this.textChannel.send('Une erreur est survenue.', {code: true});
            }
            else
                this.textChannel.send(err);
        })
        if (!url) return;

        // Get the stream
        this.getStream(url).then(async stream => {
            this.stream = stream;

            console.log('Playing stream');
            await this.phoenix.bot.user.setActivity("Loading...");
            const connection = voice.getVoiceConnection(this.textChannel.guildId)
            if (this.audioPlayer == null)
                this.audioPlayer = voice.createAudioPlayer();

            const resource = voice.createAudioResource(stream)
            this.audioPlayer.play(resource);

            connection.subscribe(this.audioPlayer);

            this.isPlaying = true;

            this.voiceHandlerOnStart();
            this.voiceHandlerOnEnd();
        }).catch(err => {
            console.error("Error while getting video infos: ", err);
            this.textChannel.send('Erreur: ' + err.message);
            return this.nextSong();
        })
    }

    static voiceHandlerOnStart() {
        this.audioPlayer.on('playing', () => {
            console.log('Playing...');
            if (typeof this.videoInfos != 'undefined')
                this.phoenix.bot.user.setActivity(this.videoInfos.videoDetails.title);
        })
    }

    static voiceHandlerOnEnd() {
        this.audioPlayer.once('idle', async (reason) => {
            await this.phoenix.bot.user.setActivity(this.phoenix.config.activity);
            this.videoInfos = null;
            this.videoUrl = null;
            console.log('End of soung: ' + reason);
            if(!this.isPlaying) return;
            
            if(this.queue.length > 0 || Play.currentPlaylist.length > 0) {
                await this.nextSong()
            }else {
                this.isPlaying = false;
                Phoenix.activities--;
                console.log("No more musics in queue, stop playing.");
                this.audioPlayer = null;
                voice.getVoiceConnection(this.textChannel.guildId).destroy();
            }
        })
    }

    static getUrlFromQuery(song) {
        return new Promise(async (resolve, reject) => {
            if (typeof song == 'undefined') return reject(new TypeError('song is not undefined'));
            let url;
            // If the video has been queued from the `playlist play` command, the id may be specified in the queue.
            if(typeof song.id !== 'undefined') {
                url = "https://youtube.com/watch?v=" + song.id;
            }else if (song.startsWith("http")) {
                url = song;
            }else {
                url = await this.getUrlFromName(song)
                if(url === null) {
                    return reject('Aucune vidéo trouvée');
                }
            }
            return resolve(url)
        })
    }

    /**
     * Push a random song of the playlist to the queue
     */
    static checkPlaylist() {
        if (this.currentPlaylist.length > 0) {
            console.log('Playing random song in playlist');
            let rand = Math.floor(Math.random() * Math.floor(this.currentPlaylist.length));
            this.queue.push(this.currentPlaylist[rand]);
        }
    }

    static skip() {
        if(this.isPlaying) {
            console.log('Skip soung');
            this.audioPlayer.stop();
        }
    }

    static async getStream(url) {
        if (typeof url == 'undefined')
            throw new TypeError('url is not defined');
        console.log('Get stream from url : ' + url);
        let infos = await youtube.getInfo(url);
        if (! infos) {
            return null;
        }
        this.videoInfos = infos;
        this.videoUrl = url;
        let stream = youtube(url, {
            filter: "audioonly",
            highWaterMark: 1<<25
        });

        stream.on('error', (err) => {
            console.error("Erreur lors de la lecture : ", err);
            this.textChannel.send("Erreur: " + err.message);
        })
        return stream;
    }

    static async getUrlFromName(name) {
        console.log('Get url from name : ' + name);
        const result = await searchApi.GetListByKeyword(name, false, 1);
        if (result.items.length === 0) {
            this.textChannel.send("Je n'ai pas trouvé la vidéo :c");
            return null;
        }
        return `https://www.youtube.com/watch?v=${result.items[0].id}`;
    }

    static async connectToVoiceChannel(channel) {
        return new Promise((resolve, reject) => {
            if(!channel) {
                reject();
            }
            const connection = voice.joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
            });
            connection.on(voice.VoiceConnectionStatus.Ready, () => {
                console.log('connected to voice channel');
                resolve();
            });
        })
    }

    static stop() {
        if(!this.isPlaying) return;
        console.log("Stopping music");
        this.isPlaying = false;
        this.phoenix.activities--;
        this.stream.end();
        voice.getVoiceConnection(this.textChannel.guildId).destroy();
    }
}
