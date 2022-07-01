import Command from "../Command.js";
import fs from "fs";
import { MessageEmbed } from "discord.js";

export default class Config extends Command {
    static name = "config";
    static alias = ["config"];
    static description = "Configure the bot";

    static async call(message, phoenix) {
        let phoenixGuild = phoenix.guilds[message.guildId];
        if (message.args.length === 0)
            await this.display(message, phoenix, phoenixGuild.config);
        else if (message.args.length === 2) {
            if (
                this.changeConfig(
                    message.args[0],
                    message.args[1],
                    phoenix,
                    phoenixGuild
                )
            )
                message.react("✅");
            else message.react("⚠️");
        }
        // Args: "permissions", command name, roles/channels/members, whitelist/blacklist, add/remove, value
        else if (
            message.args.length === 6 &&
            (message.args[0] === "permissions" || message.args[0] === "perm")
        ) {
            // Check if the permission is correct
            if (this.checkIfCommandExists(message.args[1])) {
                let scopes = ["roles", "channels", "members"];
                if (scopes.includes(message.args[2])) {
                    if (message.args[2] === "channels") {
                        message.args[5] = this.getChannelIfFromName(
                            message.args[5],
                            message.guild
                        );
                        if (!message.args[5]) {
                            message.reply(
                                'Salon introuvable. Format: "catégorie/salon"'
                            );
                            return;
                        }
                    }
                    if (
                        message.args[3] === "whitelist" ||
                        message.args[3] === "blacklist"
                    ) {
                        if (
                            message.args[4] === "add" ||
                            message.args[4] === "remove"
                        ) {
                            // Apply
                            this.changePerm(
                                message.args[1],
                                message.args[2],
                                message.args[3],
                                message.args[4],
                                message.args[5],
                                phoenixGuild
                            );
                            message.react("✅");
                            return;
                        } else
                            message.reply(
                                "Erreur sur le paramètre '" +
                                    message.args[4] +
                                    "'. Valeurs possibles: add,remove"
                            );
                    } else
                        message.reply(
                            "Erreur sur le paramètre '" +
                                message.args[3] +
                                "'. Valeurs possibles: whitelist,blacklist"
                        );
                } else
                    message.reply(
                        "Erreur sur le paramètre '" +
                            message.args[2] +
                            "'. Valeurs possibles: " +
                            scopes
                    );
            }
            message.react("⚠️");
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

    static checkIfCommandExists(name) {
        if (name === "default") return true;
        let commands = {};
        commands = require("./command");
        let com = Object.values(commands).find((c) => c.name === name);
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
            .addField("Salon Bot (id) - testchannel", config.testChannel)
            .addField(
                "Les membres sans rôles ne peuvent pas controler le bot - everyoneBlackListed",
                config.everyoneBlackListed
            )
            .addField(
                "Adresse de téléchargement des vidéos - downloadAdress",
                config.downloadAdress
            )
            .addField(
                "Port de téléchargement des vidéos - downloadPort",
                "" + config.downloadPort
            );

        message.channel.send({ embeds: [embed] }).catch((err) => {
            if (err.message === "Missing Permissions")
                message.channel.send(
                    "Erreur, mes permissions sont insuffisantes :("
                );
            else console.error(err);
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
            if (err.message === "Missing Permissions")
                message.channel.send(
                    "Erreur, mes permissions sont insuffisantes :("
                );
            else console.error(err);
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
            if (err.message === "Missing Permissions")
                message.channel.send(
                    "Erreur, mes permissions sont insuffisantes :("
                );
            else console.error(err);
        });
    }

    static async getChannelsNameFromId(channelsId, guild) {
        let res = [];
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
                    console.error("Error while loading the config file: ", err);
                    return reject();
                }
                this.compareWithSample(JSON.parse(data))
                    .then((config) => {
                        return resolve(config);
                    })
                    .catch((e) => {
                        console.error(
                            "Error while loading the config-exemple file: ",
                            e
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
                if (err) return reject();
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
