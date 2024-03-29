import Command from "../Command";
import fs from "fs";
import {Message, MessageEmbed} from "discord.js";
import logger from "../logger";
import Sentry from "@sentry/node";
import Phoenix from "../Phoenix";

export default class Config extends Command {
    static commandName = "config";
    static alias = ["config"];
    static description = "Configure the bot";

    static async call(message: Message, args: string[], phoenix: Phoenix) {
        let phoenixGuild = phoenix.guilds.get(message.guildId!)!;
        if (args.length === 0)
            await this.display(message, phoenix, phoenixGuild.config);
        else if (args.length === 2) {
            if (
                this.changeConfig(
                    args[0],
                    args[1],
                    phoenix,
                    phoenixGuild
                )
            )
                message.react("✅");
            else message.react("⚠️");
        }
        // Args: "permissions", command name, roles/channels/members, whitelist/blacklist, add/remove, value
        else if (
            args.length === 6 &&
            (args[0] === "permissions" || args[0] === "perm")
        ) {
            // Check if the permission is correct
            if (this.checkIfCommandExists(args[1], phoenix)) {
                let scopes = ["roles", "channels", "members"];
                if (scopes.includes(args[2])) {
                    if (args[2] === "channels") {
                        args[5] = this.getChannelIfFromName(
                            args[5],
                            message.guild
                        );
                        if (!args[5]) {
                            message.reply(
                                'Salon introuvable. Format: "catégorie/salon"'
                            );
                            return;
                        }
                    }
                    if (
                        args[3] === "whitelist" ||
                        args[3] === "blacklist"
                    ) {
                        if (
                            args[4] === "add" ||
                            args[4] === "remove"
                        ) {
                            // Apply
                            this.changePerm(
                                args[1],
                                args[2],
                                args[3],
                                args[4],
                                args[5],
                                phoenixGuild
                            );
                            message.react("✅");
                            return;
                        } else
                            message.reply(
                                "Erreur sur le paramètre '" +
                                    args[4] +
                                    "'. Valeurs possibles: add,remove"
                            );
                    } else
                        message.reply(
                            "Erreur sur le paramètre '" +
                                args[3] +
                                "'. Valeurs possibles: whitelist,blacklist"
                        );
                } else
                    message.reply(
                        "Erreur sur le paramètre '" +
                            args[2] +
                            "'. Valeurs possibles: " +
                            scopes
                    );
            }
            message.reply("⚠️ Cette commande n'existe pas");
        } else {
            message.react("⚠️");
            message.reply("Commande invalide.");
        }
    }

    static getChannelIfFromName(name, guild) {
        // name: 'category/channel'
        let names = name.split("/");
        let category = guild.channels.find(
            (c) => c.name.toUpperCase() === names[0].toUpperCase()
        );
        if (!category) return false;
        let channel = guild.channels.find(
            (c) =>
                c.name.toUpperCase() === names[1].toUpperCase() &&
                c.parentID === category.id
        );
        return channel ? channel.id : false;
    }

    static changePerm(commandName, scope, type, action, value, phoenixGuild) {
        if (typeof phoenixGuild.config.permissions[commandName] == "undefined")
            this.createCommandPerm(
                commandName,
                phoenixGuild.config.permissions
            );
        let list = phoenixGuild.config.permissions[commandName][scope][type];
        if (action === "add") list.push(value);
        else if (list.includes(value))
            list.splice(
                list.findIndex((el) => el === value),
                1
            );

        phoenixGuild.saveConfig();
    }

    static createCommandPerm(commandName, perms) {
        perms[commandName] = {
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
        };
    }

    static checkIfCommandExists(name, phoenix: Phoenix) {
        if (name === "default") return true;
        let com = Object.values(phoenix.commands).find((c: any) => c.commandName === name);
        return typeof com != "undefined";
    }

    static changeConfig(attribute, value, phoenix, phoenixGuild) {
        if (typeof phoenixGuild.config[attribute] == "undefined") return false;

        phoenixGuild.config[attribute] = value;
        if (attribute === "prefix") {
            phoenixGuild.config.activity = value + "help";
            phoenix.bot.user.setActivity(phoenixGuild.config.activity);
        }
        phoenixGuild.saveConfig();
        return true;
    }

    static async display(message, phoenix, config) {
        // Embed message to display the configuration file
        let embed = new MessageEmbed();
        embed
            .setTitle("Configuration")
            .setColor("ORANGE")
            .setThumbnail(phoenix.bot.user.avatarURL)
            .addField("Préfix - prefix", config.prefix)
            .addField(
                "Notification de connexion - connectionAlert",
                config.connectionAlert
            )
            .addField(
                "Notification de mise à jour - updateAlert",
                config.updateAlert
            )
            .addField(
                "Les membres sans rôles ne peuvent pas controler le bot - everyoneBlackListed",
                config.everyoneBlackListed
            )
            .addField(
                "Adresse de téléchargement des vidéos - downloadAdress",
                phoenix.config.downloadAdress
            )
            .addField(
                "Port de téléchargement des vidéos - downloadPort",
                "" + phoenix.config.downloadPort
            );

        message.channel.send({ embeds: [embed] }).catch((err) => {
            Sentry.captureException(err);
            if (err.message === "Missing Permissions")
                message.channel.send(
                    "Erreur, mes permissions sont insuffisantes :("
                );
            else logger.error(err.message, { label: "CONFIG_DISPLAY" });
        });
        // Display the permissions
        let perms = new MessageEmbed();
        perms
            .setTitle("Permissions")
            .setColor("ORANGE")
            .setThumbnail(phoenix.bot.user.avatarURL);

        // For each command, add a field with the associated permissions
        for (const command of Object.keys(config.permissions)) {
            let permissions = config.permissions[command];
            let str = "";
            if (permissions.channels.whitelist.length > 0)
                str +=
                    "channels - whitelist : " +
                    (await this.getChannelsNameFromId(
                        permissions.channels.whitelist,
                        message.guild
                    )) +
                    "\n";
            if (permissions.channels.blacklist.length > 0)
                str +=
                    "channels - blaklist : " +
                    (await this.getChannelsNameFromId(
                        permissions.channels.blacklist,
                        message.guild
                    )) +
                    "\n";
            if (permissions.roles.whitelist.length > 0)
                str +=
                    "roles - whitelist : " + permissions.roles.whitelist + "\n";
            if (permissions.roles.blacklist.length > 0)
                str +=
                    "roles - blacklist : " + permissions.roles.blacklist + "\n";
            if (permissions.members.whitelist.length > 0)
                str +=
                    "members - whitelist : " +
                    permissions.members.whitelist +
                    "\n";
            if (permissions.members.blacklist.length > 0)
                str +=
                    "members - blacklist : " +
                    permissions.members.blacklist +
                    "\n";

            if (str) perms.addField(command, str);
        }
        // Send
        message.channel.send({ embeds: [perms] }).catch((err) => {
            Sentry.captureException(err);
            if (err.message === "Missing Permissions")
                message.channel.send(
                    "Erreur, mes permissions sont insuffisantes :("
                );
            else logger.error(err, { label: "CONFIG_DISPLAY" });
        });

        let notice = new MessageEmbed();
        let description =
            "Modifier une configuration: " +
            config.prefix +
            "config {attribut} {valeur}\n";
        description += "Modifier une permission: " + config.prefix;
        description +=
            "config perm {nom de la commande} {roles|channels|members} {whitelist|blacklist} {add|remove} {nom du role|nom de la catégorie/nom du salon|tag du membre(exemple#0001)}";
        notice.setDescription(description);
        message.channel.send({ embeds: [notice] }).catch((err) => {
            Sentry.captureException(err);
            if (err.message === "Missing Permissions")
                message.channel.send(
                    "Erreur, mes permissions sont insuffisantes :("
                );
            else logger.error(err.message, { label: "CONFIG_DISPLAY" });
        });
    }

    static async getChannelsNameFromId(channelsId, guild) {
        let res: any[] = [];
        for (const id of channelsId) {
            let channel = await guild.channels.fetch(id);
            let category = await guild.channels.fetch(channel.parentID);
            res.push(category.name + "/" + channel.name);
        }
        return res;
    }

    static load() {
        return new Promise((resolve, reject) => {
            fs.readFile("./config.json", "utf-8", (err, data) => {
                if (err) {
                    Sentry.captureException(err);
                    logger.error(
                        `Error while loading the config file: ${err}`,
                        { label: "CONFIG_LOAD" }
                    );
                    return reject();
                }
                this.compareWithSample(JSON.parse(data))
                    .then((config) => {
                        return resolve(config);
                    })
                    .catch((e) => {
                        Sentry.captureException(e);
                        logger.error(
                            `Error while loading the config-exemple file: ${e}`,
                            { label: "CONFIG_LOAD" }
                        );
                        return reject();
                    });
            });
        });
    }

    /**
     * Compare the config.json with the config-exemple.json to look for git updates
     * @param {*} config
     */
    static compareWithSample(config) {
        return new Promise((resolve, reject) => {
            fs.readFile("./config-exemple.json", "utf-8", (err, data) => {
                if (err) {
                    Sentry.captureException(err);
                    return reject();
                }
                let sample = JSON.parse(data);
                Object.keys(sample).forEach((attribute) => {
                    if (typeof config[attribute] == "undefined")
                        config[attribute] = sample[attribute];
                });
                resolve(config);
            });
        });
    }
}
