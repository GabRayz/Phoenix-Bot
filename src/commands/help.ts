import Command from "../Command";
import Discord from "discord.js";
import logger from "../logger";

export default class Help extends Command {
    static commandName = "help";
    static alias = ["help", "h"];
    static description = "Affiche la liste des commandes";

    static call(msg, phoenix) {
        let config = phoenix.guilds[msg.guildId].config;
        let embed = new Discord.MessageEmbed();
        embed = embed
            .setTitle("Listes des commandes: ")
            .setColor("ORANGE")
            .setThumbnail(phoenix.bot.user.avatarURL)
            .setFooter({
                text: "Codé par GabRay",
                iconURL: msg.author.avatarURL,
            })
            .addField(config.prefix + "help", "Affiche la liste des commandes.")
            .addField(config.prefix + "off", "Redémarre le bot.")
            .addField(
                config.prefix + "clear",
                "Efface les messages de commande bot."
            )
            .addField(
                config.prefix + "play [nom/url]",
                "Ajoute une musique à la file d'attente. Démarre la lecture si aucune musique n'est en cours."
            )
            .addField(
                config.prefix + "skip",
                "Passer à la prochaine musique de la fille d'attente."
            )
            .addField(config.prefix + "stop", "Arrete la musique.")
            .addField(config.prefix + "pause", "Met la musique en pause.")
            .addField(
                config.prefix + "resume",
                "Reprend la lecture de la musique."
            )
            .addField(
                config.prefix + "info",
                "Informations sur la musique actuelle"
            )
            .addField(config.prefix + "volume [0-200]", "Règler le volume.")
            .addField(config.prefix + "queue", "Affiche la liste d'attente.")
            .addField(
                config.prefix + "playlist",
                "Gérer les playlists. `" + config.prefix + "playlist help`."
            )
            .addField(
                config.prefix + "download [{audio|video} [url]]",
                "Télécharge la vidéo jouée, ou spécifiée en argument."
            )
            .addField(config.prefix + "config", "Configurer le bot.")
            .addField(
                config.prefix + "power4",
                "Jouer au puissance 4. `" + config.prefix + "power4 stop`"
            )
            .addField(
                config.prefix + "games",
                "Jouer à des jeux. (en développement)"
            )
            .addField(config.prefix + "radio", "Écouter France Info")
            .addField(
                config.prefix + "timer {nombre} {s|m|h}",
                "Programmer un minuteur"
            );
        msg.channel.send({ embeds: [embed] }).catch((err) => {
            if (err.message == "Missing Permissions") {
                msg.channel.send(
                    "Erreur, mes permissions sont insuffisantes :("
                );
            } else logger.error(err.message, { label: "HELP" });
        });
    }
}
