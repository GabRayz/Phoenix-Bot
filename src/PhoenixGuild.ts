import MusicManager from "./MusicManager";
import GuildPlaylistManager from "./GuildPlaylistManager";
import { promises } from "fs";
import logger from "./logger";

export default class PhoenixGuild {
    config: any = null;
    bot: any = null;
    guildId: any = null;
    emojis = {};
    phoenix: any = null;
    music: MusicManager;
    playlistManager: any = null;

    constructor(guild, phoenix) {
        this.guildId = guild;
        this.phoenix = phoenix;
        this.music = new MusicManager(this);

        (async () => {
            try {
                let file = await promises.readFile(
                    `./config/${this.guildId}.json`,
                    "utf8"
                );
                this.config = JSON.parse(file);
            } catch (e) {
                this.config = this.defaultConfig();
            }
            this.playlistManager = new GuildPlaylistManager(
                this,
                this.config.playlists
            );
        })();
    }

    async fetchGuild() {
        return this.phoenix.bot.guilds.resolve(this.guildId);
    }

    checkPrefix(messageContent: string): boolean {
        let prefix = this.config.prefix.replace(
            /[-\/\\^$*+?.()|[\]{}]/g,
            "\\$&"
        );
        return messageContent.match("^" + prefix) != null;
    }

    async saveConfig() {
        this.config.playlists = this.playlistManager.playlists;
        return promises.writeFile(
            `./config/${this.guildId}.json`,
            JSON.stringify(this.config, null, 4)
        );
    }

    async importEmojis() {
        const guild = await this.fetchGuild();
        const guildEmojis = await guild.emojis.fetch();
        const files = await promises.readdir("src/emojis/");
        for (let file of files) {
            if (!file.endsWith(".png")) continue;
            const emojiName = file.split(".")[0];
            let guildEmoji = guildEmojis.find(
                (emoji) => emoji.name === emojiName
            );
            if (guildEmoji === undefined) {
                guildEmoji = await guild.emojis.create(
                    `./src/emojis/${file}`,
                    emojiName
                );
                logger.info(
                    `Created emoji ${emojiName} on guild ${guild.name}`,
                    { label: "GUILD_IMPORT_EMOJI" }
                );
            }
            this.emojis[guildEmoji.name] = guildEmoji.id;
        }
    }

    defaultConfig() {
        this.phoenix.bot.guilds.fetch(this.guildId).then((guild) => {
            this.config.guildName = guild.name;
        });
        return {
            prefix: "$",
            connectionAlert: "false",
            updateAlert: "false",
            testChannel: null,
            everyoneBlackListed: "true",
            permissions: {
                default: {
                    roles: {
                        whitelist: [],
                        blacklist: [],
                    },
                    channels: {
                        whitelist: [],
                        blacklist: [],
                    },
                    members: {
                        whitelist: [],
                        blacklist: [],
                    },
                },
            },
            playlists: {},
        };
    }
}
