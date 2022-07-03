import Command from "../Command";
import {
    getVoiceConnection,
    createAudioPlayer,
    joinVoiceChannel,
    createAudioResource,
    VoiceConnectionStatus,
} from "@discordjs/voice";
import path from "path";
import { exec } from "node:child_process";
import { promises } from "fs";
import logger from "../logger";

export default class Radio extends Command {
    static commandName = "radio";
    static alias = ["radio"];
    static description = "Écouter France Info";

    static proc: any = null;

    static stream;
    static voiceChannel;

    static isPlaying;

    static async call(message, _phoenix) {
        if (message.args.length === 0)
            this.start(message.member.voice.channel, message.channel);
        if (message.args.length === 1 && message.args[0] === "stop")
            await this.stop();
    }

    static async connectToVoiceChannel(channel) {
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
                    label: "RADIO_CONNECT_TO_VOICE_CHANNEL",
                });
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
            "curl 'https://icecast.radiofrance.fr/franceinfo-midfi.mp3'" +
            "-XGET" +
            "-H 'Accept: */*'" +
            "-H 'Connection: Keep-Alive'" +
            "-H 'Icy-Metadata: 1'" +
            "-H 'Accept-Language: fr-fr'" +
            "-H 'User-Agent: AppleCoreMedia/1.0.0.19E266 (Macintosh; U; Intel Mac OS X 10_15_4; fr_fr)'" +
            "-H 'Referer: https://embed.radiofrance.fr/franceinfo/player/direct'" +
            "-H 'Accept-Encoding: identity'" +
            "--output ./audio/franceinfo.mp3";

        this.proc = exec(curl);

        setTimeout(() => {
            this.connectToVoiceChannel(voiceChannel)
                .then(async () => {
                    const connection = getVoiceConnection(
                        voiceChannel.guild.id
                    );
                    this.stream = createAudioPlayer();
                    const resource = createAudioResource(
                        path.resolve(__dirname, "../audio/franceinfo.mp3")
                    );
                    this.stream.play(resource);
                    connection?.subscribe(this.stream);
                    this.isPlaying = true;
                })
                .catch((err) =>
                    logger.error(err.message, { label: "RADIO_START" })
                );
        }, 2000);
    }

    static async stop() {
        this.proc?.kill();
        getVoiceConnection(this.voiceChannel.guildId)?.destroy();
        return promises.unlink(
            path.resolve(__dirname, "../audio/franceinfo.mp3")
        );
    }
}
