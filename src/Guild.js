const fs = require("fs");

module.exports = class PhoenixGuild {
    config = null;
    bot = null;
    guildId = null;

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
