const Music = require("./Music");
const fs = require("fs").promises;
const GuildPlaylistManager = require("./GuildPlaylistManager");
const Sentry = require("@sentry/node");

module.exports = class PhoenixGuild {
    config = null;
    bot = null;
    guildId = null;
    emojis = {};
    phoenix = null;
    music = null;
    playlistManager = null;

    constructor(guild, phoenix) {
        this.guildId = guild;
        this.phoenix = phoenix;
        this.music = new Music(this);
        try {
            this.config = require(`../config/${guild}.json`);
        } catch (e) {
            Sentry.captureException(e);
            this.config = this.defaultConfig();
        }
        this.playlistManager = new GuildPlaylistManager(
            this,
            this.config.playlists
        );
    }

    async fetchGuild() {
        return this.phoenix.bot.guilds.resolve(this.guildId);
    }

    checkPrefix(messageContent) {
        let regex = RegExp.escape(this.config.prefix);
        return messageContent.match("^" + regex) != null;
    }

    async saveConfig() {
        this.config.playlists = this.playlistManager.playlists;
        return await fs.writeFile(
            `./config/${this.guildId}.json`,
            JSON.stringify(this.config, null, 4)
        );
    }

    async importEmojis() {
        const guild = await this.fetchGuild();
        const guildEmojis = await guild.emojis.fetch();
        const files = await fs.readdir("src/emojis/");
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
                console.log(
                    `Created emoji ${emojiName} on guild ${guild.name}`
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
};
