import Discord, {Client, Guild, Message, Snowflake} from "discord.js";
import PhoenixGuild from "./PhoenixGuild";
import Commands from "./commands/Commands";
import config from "../config/config.json" assert { type: "json" };
import logger from "./logger";
import CommandMessage from "./CommandMessage";

export default class Phoenix {
    config: any = null;
    bot: Client;
    guilds: Map<Snowflake, PhoenixGuild> = new Map<Snowflake, PhoenixGuild>();
    activities = 0;
    commands: any = Commands;

    constructor(bot: Client, botConfig: any) {
        this.bot = bot;
        this.config = botConfig;
    }

    static init(): Phoenix {
        let bot: Client = new Discord.Client({
            intents: [
                Discord.Intents.FLAGS.GUILDS,
                Discord.Intents.FLAGS.GUILD_MESSAGES,
                Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
                Discord.Intents.FLAGS.GUILD_VOICE_STATES,
                Discord.Intents.FLAGS.GUILD_PRESENCES,
            ],
        });
        return new Phoenix(bot, config);
    }

    async login() {
        this.commands = Commands;

        this.bot.on("ready", async () => {
            logger.info("Phoenix bot ready to operate", { label: "BOT" });
            this.bot.user!.setActivity(this.config.activity);
            this.bot.user!.setUsername(this.config.name);

            // Find the default guild and test Channel
            let guilds = await this.bot.guilds.fetch();
            for (const guild of guilds) {
                let phoenixGuild = new PhoenixGuild(guild[0], this);
                this.guilds.set(guild[0], phoenixGuild);
                phoenixGuild.importEmojis();
            }

            this.bot.on("messageCreate", (msg) => {
                this.onMessage(msg);
            });
        });

        this.bot.on("guildCreate", (guild: Guild) => {
            logger.info("Joining new guild " + guild.name + " (" + guild.id + ")", { label: "BOT" });
            this.addNewGuild(guild);
        });

        await this.bot.login(this.config.login);
    }

    addNewGuild(guild: Guild) {
        if (this.guilds.has(guild.id)) {
            return;
        }
        let newGuild = new PhoenixGuild(guild, this);
        newGuild.importEmojis();
        this.guilds.set(guild.id, newGuild);
    }

    onMessage(msg: Message) {
        if (msg.author.bot) return;
        if (msg.guildId === null)
            return;

        const phoenixGuild = this.guilds.get(msg.guildId);
        if (phoenixGuild === undefined)
            return;
        // let directMention = msg.mentions.members?.has(this.bot.application!.id)
        let mentionPrefix = `<@${this.bot.application!.id}>`;
        let directMention = msg.content.match(`^${mentionPrefix}.*`);
        if (directMention || phoenixGuild.checkPrefix(msg.content)) {
            logger.debug(`${msg.author.username} : ${msg.content}`, {
                label: "ON_MESSAGE",
            });
            let commandMsg = new CommandMessage(msg, directMention ? mentionPrefix : phoenixGuild.config.prefix);
            this.readCommand(commandMsg, phoenixGuild);
        }
    }

    async readCommand(commandMsg: CommandMessage, phoenixGuild) {
        let member = commandMsg.message.member;
        if (member == null)
            return;
        if (
            phoenixGuild.config.everyoneBlackListed &&
            member.roles.cache.size === 0
        ) {
            return;
        }

        Object.keys(Commands).forEach((element) => {
            if (Commands[element].match(commandMsg.command)) {
                if (
                    !this.searchPermissions(
                        Commands[element],
                        commandMsg,
                        phoenixGuild
                    )
                ) {
                    logger.error("Permission denied", {
                        label: "READ_COMMAND",
                    });
                    commandMsg.message.reply("Patouche");
                    return;
                }
                if (
                    !commandMsg.message.guild &&
                    (typeof Commands[element].callableFromMP == "undefined" ||
                        !Commands[element].callableFromMP)
                )
                    return;
                Commands[element].call(commandMsg.message, commandMsg.args, this);
            }
        });
    }

    searchPermissions(command, message: CommandMessage, phoenixGuild: PhoenixGuild): boolean {
        for (let name of Object.keys(phoenixGuild.config.permissions)) {
            if (name === command.commandName) {
                let perm = phoenixGuild.config.permissions[name];
                return this.checkPermissions(perm, message);
            }
        }
        return this.checkPermissions(
            phoenixGuild.config.permissions.default,
            message
        );
    }

    checkPermissions(perm, commandMsg: CommandMessage): boolean {
        let member = commandMsg.message.member;
        if (member == null)
            return false;
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
            perm.channels.blacklist.includes(commandMsg.channel.id)
        ) {
            return false;
        }
        if (perm.members.blacklist.includes(commandMsg.author.tag)) {
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
            !perm.channels.whitelist.includes(commandMsg.channel.id)
        ) {
            return false;
        }
        return !(
            perm.members.whitelist.length > 0 &&
            !perm.members.whitelist.includes(commandMsg.author.tag)
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
