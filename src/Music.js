const {setTimeout: wait} = require("node:timers/promises");
const voice = require("@discordjs/voice");
const youtube = require("ytdl-core");
const searchApi = require("youtube-search-api");
const Discord = require("discord.js");
const {MessageActionRow, MessageButton} = require("discord.js");
module.exports = class Music {
    /**
     * List of songs to be played, represented by a name or a url
     */
    queue = [];
    /**
     * Defines if the bot is currently playing music.
     */
    isPlaying = false;
    /**
     * List of songs of the current playlist.
     */
    currentPlaylist = [];
    /**
     * Name of the current playlist
     */
    currentPlaylistName = "";
    volume = 1;

    /**
     * Infos on the currently playing video.
     */
    videoInfos = null;
    videoUrl = null;
    audioPlayer = null;
    statusMessage = null;

    phoenixGuild = null;


    constructor(phoenixGuild) {
        this.phoenixGuild = phoenixGuild;
    }

    /**
     * Joins a voice channel and calls this.nextSong() to start playing.
     * @param {*} message
     */
    async start(message) {
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
            });
            this.setupEventInteractions();
        }
    }

    setupEventInteractions() {
        this.phoenixGuild.phoenix.bot.on('interactionCreate', async interaction => {
            if (interaction.isButton() && interaction.customId === 'phoenixMusicNext'
                || interaction.customId === 'phoenixMusicPause'
                || interaction.customId === 'phoenixMusicPlay'
                || interaction.customId === 'phoenixMusicStop') {
                interaction.deferUpdate();
                if (interaction.customId === 'phoenixMusicNext')
                    await this.skip();
                else if (interaction.customId === 'phoenixMusicPause')
                    this.pause();
                else if (interaction.customId === 'phoenixMusicPlay')
                    this.resume();
                else if (interaction.customId === 'phoenixMusicStop')
                    this.stop();
                await wait(500);
                interaction.editReply({});
            }
        });
    }

    pause() {
        if (this.audioPlayer != null)
            this.audioPlayer.pause();
    }

    resume() {
        if (this.audioPlayer != null)
            this.audioPlayer.unpause();
    }

    addToQueue(message) {
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

    addToQueueObject(video) {
        console.log("Queueing: " + video.name);
        this.queue.push(video);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async nextSong() {
        await this.sleep(200);
        // If it this the first song to be played, add an activity to Phoenix
        if (!this.isPlaying)
            this.phoenixGuild.phoenix.activities++;

        console.log('Choosing next song...');
        if(this.queue.length === 0) {
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
            await this.phoenixGuild.phoenix.bot.user.setActivity("Loading...");
            const connection = voice.getVoiceConnection(this.textChannel.guildId)
            if (this.audioPlayer == null)
                this.audioPlayer = voice.createAudioPlayer();

            const resource = voice.createAudioResource(stream)
            this.audioPlayer.play(resource);

            connection.subscribe(this.audioPlayer);

            this.isPlaying = true;

            this.voiceHandlerOnStart();
            this.audioPlayer.once('idle', async () => {
                await this.voiceHandlerOnEnd();
            });
            await this.displayStatusMessage();
        }).catch(err => {
            console.error("Error while getting video infos: ", err);
            this.textChannel.send('Erreur: ' + err.message);
            return this.nextSong();
        })
    }

    voiceHandlerOnStart() {
        this.audioPlayer.on('playing', () => {
            console.log('Playing...');
            if (typeof this.videoInfos != 'undefined')
                this.phoenixGuild.phoenix.bot.user.setActivity(this.videoInfos.videoDetails.title);
        })
    }

    async voiceHandlerOnEnd() {
        await this.phoenixGuild.phoenix.bot.user.setActivity(this.phoenixGuild.phoenix.config.activity);
        this.videoInfos = null;
        this.videoUrl = null;
        if(!this.isPlaying) return;

        if(this.queue.length > 0 || this.currentPlaylist.length > 0) {
            await this.nextSong()
        }else {
            console.log("No more musics in queue, stop playing.");
            this.stop();
        }
    }

    getUrlFromQuery(song) {
        return new Promise(async (resolve, reject) => {
            if (typeof song == 'undefined') return reject(new TypeError('song is not undefined'));
            let url;
            // If the video has been queued from the `playlist play` command, the id may be specified in the queue.
            if(typeof song.id !== 'undefined' && song.id != null && song.id !== '') {
                url = "https://youtube.com/watch?v=" + song.id;
            }else if (song.name.startsWith("http")) {
                url = song.name;
            }else {
                url = await this.getUrlFromName(song.name)
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
    checkPlaylist() {
        if (this.currentPlaylist.length > 0) {
            console.log('Playing random song in playlist');
            let rand = Math.floor(Math.random() * this.currentPlaylist.length);
            this.queue.push(this.currentPlaylist[rand]);
        }
    }

    async skip() {
        if(this.isPlaying) {
            console.log('Skip soung');
            await this.voiceHandlerOnEnd();
        }
    }

    async getStream(url) {
        if (typeof url == 'undefined')
            throw new TypeError('url is not defined');
        console.log('Get stream from url : ' + url);
        let infos
        try {
            infos = await youtube.getInfo(url);
        } catch (e) {
            console.error(e);
            this.stop();
        }
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

    async getUrlFromName(name) {
        console.log('Get url from name : ' + name);
        const result = await searchApi.GetListByKeyword(name, false, 1);
        if (result.items.length === 0) {
            this.textChannel.send("Je n'ai pas trouvé la vidéo :c");
            return null;
        }
        return `https://www.youtube.com/watch?v=${result.items[0].id}`;
    }

    async connectToVoiceChannel(channel) {
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

    stop() {
        if(!this.isPlaying) return;
        this.audioPlayer = null;
        console.log("Stopping music");
        this.isPlaying = false;
        this.phoenixGuild.phoenix.activities--;
        this.stream.end();
        const oldStatusMessage = this.statusMessage;
        this.statusMessage = null;
        wait(10000).then(() => oldStatusMessage.delete());
        voice.getVoiceConnection(this.textChannel.guildId).destroy();
    }

    async displayStatusMessage() {
        const details = this.videoInfos.videoDetails;
        let maxSizedThumbnail = details.thumbnails[0];
        for (let thumbnail of details.thumbnails) {
            if (thumbnail.width > maxSizedThumbnail.width)
                maxSizedThumbnail = thumbnail;
        }
        const embed = new Discord.MessageEmbed();
        embed.setImage(maxSizedThumbnail.url);
        embed.setTitle(details.title);
        embed.setDescription("Now playing...");
        embed.setColor([155, 44, 149]);
        const messageData = {
            embeds: [embed],
            components: [
                new MessageActionRow({
                    components: [
                        new MessageButton({
                            emoji: this.phoenixGuild.emojis['pause'],
                            customId: "phoenixMusicPause",
                            style: "SECONDARY"
                        }),
                        new MessageButton({
                            emoji: this.phoenixGuild.emojis['play'],
                            customId: "phoenixMusicPlay",
                            style: "SECONDARY"
                        }),
                        new MessageButton({
                            emoji: this.phoenixGuild.emojis['next'],
                            customId: "phoenixMusicNext",
                            style: "SECONDARY"
                        }),
                        new MessageButton({
                            emoji: this.phoenixGuild.emojis['stop'],
                            customId: "phoenixMusicStop",
                            style: "SECONDARY"
                        })
                    ]
                })
            ]
        };
        if (this.statusMessage == null)
            this.statusMessage = await this.textChannel.send(messageData);
        else
            this.statusMessage.edit(messageData);
    }
}