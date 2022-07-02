import Discord from "discord.js";
import PhoenixGuild from "./Guild.js";
import Commands from "./commands/command.js";
import config from "../config.json" assert { type: "json" };

export default class Phoenix {
    config: any = null;
    bot: any = null;
    guilds = {};
    activities = 0;

    async loadConfig() {
        this.config = config;
    }

    async login() {
        this.bot = new Discord.Client({
            intents: [
                Discord.Intents.FLAGS.GUILDS,
                Discord.Intents.FLAGS.GUILD_MESSAGES,
                Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
                Discord.Intents.FLAGS.GUILD_VOICE_STATES,
                Discord.Intents.FLAGS.GUILD_PRESENCES,
            ],
        });

        this.bot.on("ready", async () => {
            console.log("Phoenix bot ready to operate");
            this.bot.user.setActivity(this.config.activity);
            this.bot.user.setUsername(this.config.name);

            // Find the default guild and test Channel
            let guilds = await this.bot.guilds.fetch();
            for (const guild of guilds) {
                this.guilds[guild[0]] = new PhoenixGuild(guild[0], this);
                this.guilds[guild[0]].importEmojis();
            }

            this.bot.on("messageCreate", (msg) => {
                this.onMessage(msg);
            });
        });

        await this.bot.login(this.config.login);
    }

    onMessage(msg) {
        const phoenixGuild = this.guilds[msg.guildId];
        if (phoenixGuild.checkPrefix(msg.content)) {
            console.log(msg.author.username + " : " + msg.content);
            let msgParts = msg.content.split(" ");
            let command = msgParts[0].slice(phoenixGuild.config.prefix.length);
            msg.args = msgParts.slice(1);
            msg.command = command;
            this.readCommand(msg, command, phoenixGuild);
        }
    }

    async readCommand(message, command, phoenixGuild) {
        let member = message.member;
        if (
            phoenixGuild.config.everyoneBlackListed &&
            member.roles.length === 0
        ) {
            return;
        }

        Object.keys(Commands).forEach((element) => {
            if (Commands[element].match(command)) {
                if (
                    !this.searchPermissions(
                        Commands[element],
                        message,
                        phoenixGuild
                    )
                ) {
                    console.log("Permission denied");
                    message.reply("Patouche");
                    return;
                }
                if (
                    !message.guild &&
                    (typeof Commands[element].callableFromMP == "undefined" ||
                        !Commands[element].callableFromMP)
                )
                    return;
                Commands[element].call(message, this);
            }
        });
    }

    searchPermissions(command, message, phoenixGuild) {
        for (let name of Object.keys(phoenixGuild.config.permissions)) {
            if (name === command.name) {
                let perm = phoenixGuild.config.permissions[name];
                return this.checkPermissions(perm, message);
            }
        }
        return this.checkPermissions(
            phoenixGuild.config.permissions.default,
            message
        );
    }

    checkPermissions(perm, message) {
        let member = message.member;
        let role = member.roles.highest;
        // check blacklists
        if (
            perm.roles.blacklist.length > 0 &&
            perm.roles.blacklist.includes(role.name)
        ) {
            return false;
        }
        if (
            perm.channels.blacklist.length > 0 &&
            perm.channels.blacklist.includes(message.channel.id)
        ) {
            return false;
        }
        if (perm.members.blacklist.includes(message.author.tag)) {
            return false;
        }

        // check whitelists
        if (
            perm.roles.whitelist.length > 0 &&
            !perm.roles.whitelist.includes(role.name)
        ) {
            return false;
        }
        if (
            perm.channels.whitelist.length > 0 &&
            !perm.channels.whitelist.includes(message.channel.id)
        ) {
            return false;
        }
        return !(
            perm.members.whitelist.length > 0 &&
            !perm.members.whitelist.includes(message.author.tag)
        );
    }

    sendClean(msg, channel, time = 20000) {
        channel.send(msg).then((message) => {
            setTimeout(() => {
                if (!message.deleted) message.delete();
            }, time);
        });
    }
}
