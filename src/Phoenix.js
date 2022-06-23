const Discord = require('discord.js');
const PhoenixGuild = require("./Guild.js");
const Commands = require("../commands/command");

module.exports = class Phoenix {

    config = null;
    bot = null;
    guilds = {};
    activities = 0;

    async loadConfig() {
        this.config = require('../config');
    }

    async login() {
        this.bot = new Discord.Client({intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Discord.Intents.FLAGS.GUILD_VOICE_STATES]});

        this.bot.on('ready', async () => {
            console.log('Phoenix bot ready to operate');
            this.bot.user.setActivity(this.config.activity)
            this.bot.user.setUsername(this.config.name)

            // Find the default guild and test Channel
            let guilds = await this.bot.guilds.fetch()
            for (const guild of guilds) {
                this.guilds[guild[0]] = new PhoenixGuild(guild[0], this.bot);
            }

            this.bot.on('message', (msg) => {
                this.onMessage(msg)
            });
        });

        await this.bot.login(this.config.login);
    }

    onMessage(msg) {
        const phoenixGuild = this.guilds[msg.guildId];
        if (phoenixGuild.checkPrefix(msg.content)) {
            console.log(msg.author.username + ' : ' + msg.content);
            let msgParts = msg.content.split(' ');
            let command = msgParts[0].slice(phoenixGuild.config.prefix.length);
            msg.args = msgParts.slice(1);
            msg.command = command;
            this.readCommand(msg, command, phoenixGuild);
        }
    }

    async readCommand(message, command, phoenixGuild) {
        let member = message.member;
        if (phoenixGuild.config.everyoneBlackListed && member.roles.length === 0) {
            return;
        }

        Object.keys(Commands).forEach(element => {
            if (Commands[element].match(command)) {
                // if (!searchPermissions(Commands[element], message)) {
                //     PermissionDenied(message);
                //     return;
                // }
                if (!message.guild && (typeof Commands[element].callableFromMP == 'undefined' || !Commands[element].callableFromMP))
                    return
                Commands[element].call(message, this);
            }
        });
    }

    sendClean(msg, channel, time = 20000) {
        channel.send(msg)
            .then((message) => {
                setTimeout(() => {
                    if (!message.deleted)
                        message.delete();
                }, time);
            })
    }
}