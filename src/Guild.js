const fs = require("fs").promises;

module.exports = class PhoenixGuild {
    config = null;
    bot = null;
    guildId = null;
    emojis = {};

    constructor(guild, bot) {
        this.guildId = guild;
        this.bot = bot;
        try {
            this.config = require(`../config/${guild}.json`);
        } catch (e) {
            this.config = this.defaultConfig();
        }
    }

    async fetchGuild() {
        return this.bot.guilds.resolve(this.guildId);
    }

    checkPrefix(messageContent) {
        let regex = RegExp.escape(this.config.prefix);
        return messageContent.match('^' + regex) != null;
    }

    saveConfig() {
        fs.writeFile(`./config/${this.guildId}.json`, JSON.stringify(this.config, null, 4), (err) => {
            if (err) console.error('Error while saving the config: ', err);
        })
    }

    async importEmojis() {
        const guild = await this.fetchGuild();
        const guildEmojis = await guild.emojis.fetch()
        const files = await fs.readdir('src/emojis/');
        for (let file of files) {
            if (!file.endsWith('.png'))
                continue;
            const emojiName = file.split('.')[0];
            let guildEmoji = guildEmojis.find(emoji => emoji.name === emojiName);
            if (guildEmoji === undefined) {
                guildEmoji = await guild.emojis.create(`./src/emojis/${file}`, emojiName);
                console.log(`Created emoji ${emojiName} on guild ${guild.name}`);
            }
            this.emojis[guildEmoji.name] = guildEmoji.id;
        }
    }

    defaultConfig() {
        this.bot.guilds.fetch(this.guildId).then(guild => {
            this.config.guildName = guild.name;
        })
        return {
            "prefix": "$",
            "connectionAlert": "false",
            "updateAlert": "false",
            "testChannel": null,
            "everyoneBlackListed": "true",
            "downloadPort": 8008,
            "downloadAdress": "http://localhost",
            "permissions": {
                "default": {
                    "roles": {
                        "whitelist": [],
                        "blacklist": []
                    },
                    "channels": {
                        "whitelist": [],
                        "blacklist": []
                    },
                    "members": {
                        "whitelist": [],
                        "blacklist": []
                    }
                }
            }
        }
    }
}
