import Command from "../Command";
import http from "http";
import { Server } from "socket.io";
import { io as ioClient } from "socket.io-client";
import logger from "../logger";
import {Message, TextChannel} from "discord.js";
import Phoenix from "../Phoenix";

export default class Link extends Command {
    static commandName = "link";
    static alias = ["link"];
    static description = "Connecte ce salon au réseau textuel de Phoenix";

    static textChannel;
    static socket;

    static Phoenix: any;

    static async call(message: Message, args: string[], phoenix: Phoenix) {
        if (args.length > 0 && args[0] == "unlink") {
            // Unlink
            if (
                this.socket &&
                this.textChannel &&
                this.textChannel.id == message.channel.id
            ) {
                this.unlink();
            }
        } else if (
            this.textChannel != null &&
            this.textChannel.id != message.channel.id
        ) {
            // Change channel
            logger.debug("Changing room", { label: "LINK" });
            this.textChannel.send(
                "Changement de salon. Nouveau : " + (message.channel! as TextChannel).name
            );
            message.channel.send("Changement de salon effectué.");
            this.textChannel = message.channel;
        } else {
            this.textChannel = message.channel;
            this.Phoenix = phoenix;
            let isThereAServer = await this.testConnection(phoenix.config.host);
            logger.debug(`${isThereAServer}`, { label: "LINK" });
            if (isThereAServer) {
                this.connect();
            } else {
                this.createServer();
            }
            this.Phoenix.bot.on("message", (msg) => {
                // When a non-bot message is sent in the channel
                if (msg.channel.id == Link.textChannel.id && !msg.author.bot) {
                    Link.socket.emit(
                        "chat message",
                        msg.content,
                        msg.author.username
                    );
                }
            });
        }
    }

    static unlink() {
        this.textChannel.send("Déconnexion du réseau.");
        if (this.socket.close) this.socket.close();
        else this.socket.disconnect();
        this.socket = null;
        this.textChannel = null;
    }

    static testConnection(host) {
        return new Promise<boolean>((resolve, reject) => {
            http.get("http://localhost:8081", (_err) => {
                resolve(true);
            }).on("error", (e) => {
                resolve(false);
            });
        });
    }

    static createServer() {
        let server = http.createServer(function (req, res) {
            logger.debug("Received a connection to http server", {
                label: "LINK_CREATE_SERVER",
            });
            res.end("Done");
        });
        logger.debug("HTTP server created", { label: "LINK_CREATE_SERVER" });
        this.textChannel.send("Connexion au réseau Phoenix établie", {
            code: true,
        });

        server.listen(8081);
        const io = new Server(server);
        io.listen(server);
        io.sockets.on("connection", function (socket) {
            Link.textChannel.send(
                "Un nouveau serveur s'est connecté au réseau Phoenix",
                { code: true }
            );
            Link.socket = socket;
            socket.on("chat message", function (msg, username) {
                Link.textChannel.send("**" + username + "** : " + msg);
            });
        });
    }

    static connect() {
        const socket = ioClient("http://localhost:8081", {
            reconnection: true,
        });
        socket.on("connect", function () {
            Link.textChannel.send("Connecté au réseau Phoenix", { code: true });
        });
        socket.on("chat message", function (msg, username) {
            Link.textChannel.send("**" + username + "** : " + msg);
        });
        Link.socket = socket;
    }
}
