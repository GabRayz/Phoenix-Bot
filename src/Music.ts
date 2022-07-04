import { setTimeout as wait } from "node:timers/promises";
import {
    getVoiceConnection,
    createAudioPlayer,
    joinVoiceChannel,
    createAudioResource,
    VoiceConnectionStatus,
} from "@discordjs/voice";
import youtube from "ytdl-core";
import searchApi from "youtube-search-api";
import Discord, { MessageActionRow, MessageButton } from "discord.js";
import logger from "./logger";
import Sentry from "@sentry/node";

export default class Music {
    /**
     * List of songs to be played, represented by a name or a url
     */
    queue: any[] = [];
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
    videoInfos: any = null;
    videoUrl: any = null;
    audioPlayer: any = null;
    statusMessage: any = null;

    phoenixGuild: any = null;

    textChannel: any = null;
    stream: any = null;

    constructor(phoenixGuild) {
        this.phoenixGuild = phoenixGuild;
    }

    /**
     * Joins a voice channel and calls this.nextSong() to start playing.
     * @param {*} message
     */
    async start(message) {
        // Do nothing if the voice is already started
        if (!this.isPlaying) {
            logger.debug("Connecting to voice channel", {
                label: "START_MUSIC",
            });
            this.textChannel = message.channel;
            if (getVoiceConnection(this.textChannel.guildId) !== undefined)
                return this.nextSong();
            this.connectToVoiceChannel(message.member.voice.channel)
                .then(() => {
                    logger.debug(
                        `Connected to voice channel ${message.member.voice.channel.name}`,
                        { label: "START_MUSIC" }
                    );
                    this.nextSong();
                })
                .catch((err) => {
                    this.textChannel.send(
                        "Tu n'es pas connecté à un channel vocal ='("
                    );
                    logger.error("User not connected to a voice channel", {
                        label: "START_MUSIC",
                    });
                    Sentry.captureException(err);
                });
            this.setupEventInteractions();
        }
    }

    setupEventInteractions() {
        this.phoenixGuild.phoenix.bot.on(
            "interactionCreate",
            async (interaction) => {
                if (
                    (interaction.isButton() &&
                        interaction.customId === "phoenixMusicNext") ||
                    interaction.customId === "phoenixMusicPause" ||
                    interaction.customId === "phoenixMusicPlay" ||
                    interaction.customId === "phoenixMusicStop"
                ) {
                    interaction.deferUpdate();
                    logger.info(
                        `Interaction ${interaction.customId} from user ${interaction.user.tag}`,
                        { label: "MUSIC_SETUP_EVENT_INTERACTION" }
                    );
                    if (interaction.customId === "phoenixMusicNext")
                        await this.skip();
                    else if (interaction.customId === "phoenixMusicPause")
                        this.pause();
                    else if (interaction.customId === "phoenixMusicPlay")
                        this.resume();
                    else if (interaction.customId === "phoenixMusicStop")
                        this.stop();
                    await wait(500);
                    interaction.editReply({});
                }
            }
        );
    }

    pause() {
        if (this.audioPlayer != null) this.audioPlayer.pause();
    }

    resume() {
        if (this.audioPlayer != null) this.audioPlayer.unpause();
    }

    addToQueue(message) {
        let name = "";
        message.args.forEach((str) => {
            name += str + " ";
        });
        logger.debug(`Queueing: ${name}`, { label: "MUSIC_ADD_TO_QUEUE" });
        this.queue.push({
            name: name,
            id: null,
        });
        message.react("✅");
    }

    addToQueueObject(video) {
        logger.debug(`Queueing: ${video.name}`, {
            label: "MUSIC_ADD_TO_QUEUE_OBJECT",
        });
        this.queue.push(video);
    }

    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async nextSong() {
        await this.sleep(200);
        // If it this the first song to be played, add an activity to Phoenix
        if (!this.isPlaying) this.phoenixGuild.phoenix.activities++;

        logger.debug("Choosing next song...", { label: "MUSIC_NEXT_SONG" });
        if (this.queue.length === 0) {
            if (this.currentPlaylist.length > 0) {
                this.checkPlaylist();
            } else {
                return;
            }
        }
        let song = this.queue.shift();
        logger.debug(`Next song: ${song.name}`, { label: "MUSIC_NEXT_SONG" });

        // Get video url
        let url = await this.getUrlFromQuery(song).catch((err) => {
            Sentry.captureException(err);
            if (err instanceof TypeError) {
                logger.error(err.message, { label: "MUSIC_NEXT_SONG" });
                this.textChannel.send("Une erreur est survenue.", {
                    code: true,
                });
            } else this.textChannel.send(err);
        });
        if (!url) return;

        this.videoInfos = await this.getVideoInfo(url);
        if (this.videoInfos == null) {
            this.textChannel.send(`Vidéo introuvable : ${song.name}`);
            return this.nextSong();
        }

        // Get the stream
        this.getStream(url)
            .then(async (stream) => {
                this.stream = stream;

                logger.debug("Playing stream", { label: "MUSIC_NEXT_SONG" });
                await this.phoenixGuild.phoenix.bot.user.setActivity(
                    "Loading..."
                );
                const connection = getVoiceConnection(this.textChannel.guildId);
                if (this.audioPlayer == null)
                    this.audioPlayer = createAudioPlayer();

                const resource = createAudioResource(stream);
                this.audioPlayer.play(resource);

                connection?.subscribe(this.audioPlayer);

                this.isPlaying = true;

                this.voiceHandlerOnStart();
                this.audioPlayer.once("idle", async () => {
                    await this.voiceHandlerOnEnd();
                });
                await this.displayStatusMessage();
            })
            .catch((err) => {
                Sentry.captureException(err);
                logger.error(`Error while getting video infos: ${err}`, {
                    label: "MUSIC_NEXT_SONG",
                });
                this.textChannel.send("Erreur: " + err.message);
                return this.nextSong();
            });
    }

    voiceHandlerOnStart() {
        this.audioPlayer.on("playing", () => {
            logger.debug("Playing...", {
                label: "MUSIC_VOICE_HANDLER_ON_START",
            });
            if (typeof this.videoInfos != "undefined")
                this.phoenixGuild.phoenix.bot.user.setActivity(
                    this.videoInfos.videoDetails.title
                );
        });
    }

    async voiceHandlerOnEnd() {
        await this.phoenixGuild.phoenix.bot.user.setActivity(
            this.phoenixGuild.phoenix.config.activity
        );
        this.videoInfos = null;
        this.videoUrl = null;
        if (!this.isPlaying) return;

        if (this.queue.length > 0 || this.currentPlaylist.length > 0) {
            await this.nextSong();
        } else {
            logger.debug("No more musics in queue, stop playing.", {
                label: "MUSIC_VOICE_HANDLER_ON_END",
            });
            this.stop();
        }
    }

    getUrlFromQuery(song) {
        return new Promise(async (resolve, reject) => {
            if (typeof song == "undefined")
                return reject(new TypeError("song is not undefined"));
            let url;
            // If the video has been queued from the `playlist play` command, the id may be specified in the queue.
            if (
                typeof song.id !== "undefined" &&
                song.id != null &&
                song.id !== ""
            ) {
                url = "https://youtube.com/watch?v=" + song.id;
            } else if (song.name.startsWith("http")) {
                url = song.name;
            } else {
                url = await this.getUrlFromName(song.name);
                if (url === null) {
                    return reject("Aucune vidéo trouvée");
                }
            }
            return resolve(url);
        });
    }

    /**
     * Push a random song of the playlist to the queue
     */
    checkPlaylist() {
        if (this.currentPlaylist.length > 0) {
            logger.debug("Playing random song in playlist", {
                label: "MUSIC_CHECK_PLAYLIST",
            });
            let rand = Math.floor(Math.random() * this.currentPlaylist.length);
            this.queue.push(this.currentPlaylist[rand]);
        }
    }

    async skip() {
        if (this.isPlaying) {
            logger.debug("Skip soung", { label: "MUSIC_SKIP" });
            await this.voiceHandlerOnEnd();
        }
    }

    async getVideoInfo(url) {
        if (typeof url == "undefined")
            throw new TypeError("url is not defined");
        try {
            return await youtube.getInfo(url);
        } catch (e: any) {
            logger.info('Video not found');
            this.stop();
            return null;
        }
    }

    async getStream(url) {
        this.videoUrl = url;
        // 'audioonly' filter breaks with live videos
        const options: youtube.downloadOptions = this.videoInfos.videoDetails
            .isLive
            ? { highWaterMark: 1 << 15 }
            : { highWaterMark: 1 << 25, filter: "audioonly" };
        let stream = youtube(url, options);

        stream.on("error", (err) => {
            logger.error(`Erreur lors de la lecture : ${err}`, {
                label: "MUSIC_GET_STREAM",
            });
            this.textChannel.send("Erreur: " + err.message);
        });
        return stream;
    }

    async getUrlFromName(name) {
        logger.debug(`Get url from name : ${name}`, {
            label: "MUSIC_GET_URL_FROM_NAME",
        });
        const result = await searchApi.GetListByKeyword(name, false, 1);
        if (result.items.length === 0) {
            this.textChannel.send("Je n'ai pas trouvé la vidéo :c");
            return null;
        }
        return `https://www.youtube.com/watch?v=${result.items[0].id}`;
    }

    async connectToVoiceChannel(channel) {
        return new Promise<void>((resolve, reject) => {
            if (!channel) {
                reject();
            }
            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
            });
            connection.on(VoiceConnectionStatus.Ready, () => {
                logger.debug("Connected to voice channel", {
                    label: "MUSIC_CONNECT_TO_VOICE_CHANNEL",
                });
                resolve();
            });
        });
    }

    stop() {
        if (!this.isPlaying) return;
        this.audioPlayer = null;
        logger.debug("Stopping music", { label: "MUSIC_STOP" });
        this.isPlaying = false;
        this.phoenixGuild.phoenix.activities--;
        this.stream.end();
        const oldStatusMessage = this.statusMessage;
        this.statusMessage = null;
        wait(10000).then(() => oldStatusMessage.delete());
        getVoiceConnection(this.textChannel.guildId)?.destroy();
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
                            emoji: this.phoenixGuild.emojis["pause"],
                            customId: "phoenixMusicPause",
                            style: "SECONDARY",
                        }),
                        new MessageButton({
                            emoji: this.phoenixGuild.emojis["play"],
                            customId: "phoenixMusicPlay",
                            style: "SECONDARY",
                        }),
                        new MessageButton({
                            emoji: this.phoenixGuild.emojis["next"],
                            customId: "phoenixMusicNext",
                            style: "SECONDARY",
                        }),
                        new MessageButton({
                            emoji: this.phoenixGuild.emojis["stop"],
                            customId: "phoenixMusicStop",
                            style: "SECONDARY",
                        }),
                    ],
                }),
            ],
        };
        if (this.statusMessage == null)
            this.statusMessage = await this.textChannel.send(messageData);
        else this.statusMessage.edit(messageData);
    }
}
