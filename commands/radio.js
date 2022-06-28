let Command = require("../src/Command");
const opus = require("opusscript");
const { exec } = require("node:child_process");
const voice = require("@discordjs/voice");
let phoenix = require("../index");

const path = require("path");

module.exports = class Radio extends Command {
    static name = "radio";
    static alias = ["radio"];
    static description = "Écouter France Info";

    proc = null;

    static stream;
    static voiceChannel;

    static async call(message, phoenix) {
        if (message.args.length == 0)
            this.start(message.member.voice.channel, message.channel);
        if (message.args.length == 1 && message.args[0] == "stop") this.stop();
    }

    static async connectToVoiceChannel(channel) {
        return new Promise((resolve, reject) => {
            if (!channel) {
                reject();
            }
            const connection = voice.joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
            });
            connection.on(voice.VoiceConnectionStatus.Ready, () => {
                console.log("connected to voice channel");
                resolve();
            });
        });
    }

    static start(voiceChannel, textChannel) {
        if (!voiceChannel) {
            textChannel.send("Tu n'es pas connecté à un channel vocal ='(");
            return;
        }
        this.voiceChannel = voiceChannel;

        let curl =
            "curl 'https://icecast.radiofrance.fr/franceinfo-midfi.mp3' \
        -XGET \
        -H 'Accept: */*' \
        -H 'Connection: Keep-Alive' \
        -H 'Icy-Metadata: 1' \
        -H 'Accept-Language: fr-fr' \
        -H 'User-Agent: AppleCoreMedia/1.0.0.19E266 (Macintosh; U; Intel Mac OS X 10_15_4; fr_fr)' \
        -H 'Referer: https://embed.radiofrance.fr/franceinfo/player/direct' \
        -H 'Accept-Encoding: identity' \
        --output ./audio/franceinfo.mp3";

        // this.proc = exec(curl);

        setTimeout(() => {
            this.connectToVoiceChannel(voiceChannel)
                .then(async () => {
                    const connection = voice.getVoiceConnection(
                        voiceChannel.guild.id
                    );
                    this.stream = voice.createAudioPlayer();
                    const resource = voice.createAudioResource(
                        path.resolve(__dirname, "../audio/franceinfo.mp3")
                    );
                    this.stream.play(resource);
                    connection.subscribe(this.stream);
                    this.isPlaying = true;
                    // this.stream = await voiceConnection.playFile(
                    //     path.resolve(__dirname, "../audio/franceinfo.mp3")
                    // );
                    // this.stream.on("end", (e) => {
                    //     console.log("Fin de France Info");
                    // });
                    // this.stream.on("error", (e) => {
                    //     console.error(e);
                    // });
                    // this.stream.on("start", () => {
                    //     console.log("Listening to France Info!");
                    // });
                })
                .catch((e) => console.error);
        }, 2000);
        return;
    }

    static stop() {
        // this.stream.end();
        this.proc?.kill();
        voice.getVoiceConnection(this.voiceChannel.guild.id).destroy();
        this.voiceChannel.leave();
    }
};
