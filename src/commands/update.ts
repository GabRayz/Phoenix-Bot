import Command from "../Command";
import fs from "fs";
import { exec } from "child_process";
import Phoenix from "../../index";
import logger from "../logger";

export default class Update extends Command {
    static commandName = "update";
    static alias = ["update", "u"];
    static description = "Mettre à jour le bot";

    static call(message, phoenix) {
        this.checkForUpdate((res) => {
            if (!res) {
                message.channel.send("Phoenix est déjà à jour.");
            } else {
                message.channel.send("Mise à jour de Phoenix...");
                this.update((error) => {
                    message.channel.send("Echec de la mise à jour.");
                });
            }
        });
    }

    static autoUpdate() {
        this.checkForUpdate((res) => {
            if (res) {
                if (Phoenix.bot != null && Phoenix.config.updateAlert == "true")
                    Phoenix.bot.send("Installation de la mise à jour...", {
                        code: true,
                    });
                this.update(() => {});
            }
        });
    }

    static checkForUpdate(callback) {
        this.readVersion()
            .then((version) => {
                exec("git pull", (error) => {
                    if (error) {
                        logger.error(error.message, {
                            label: "UPDATE_CHECK_FOR_UPDATE",
                        });
                        return false;
                    }
                    this.readVersion()
                        .then((newVersion) => {
                            callback(version != newVersion);
                        })
                        .catch((err) =>
                            logger.error(err.message, {
                                label: "UPDATE_CHECK_FOR_UPDATE",
                            })
                        );
                });
            })
            .catch((err) =>
                logger.error(err.message, { label: "UPDATE_CHECK_FOR_UPDATE" })
            );
    }

    static update(callback) {
        logger.info("Updating...", { label: "UPDATE_UPDATE" });
        fs.writeFile("./temoin", "", async () => {
            logger.debug("Temoin créé", { label: "UPDATE_UPDATE" });
            await Phoenix.bot.user.setActivity("Mise à jour...");
            exec("./update", (error) => {
                if (error) {
                    logger.error(`Failed to update: ${error}`, {
                        label: "UPDATE_UPDATE",
                    });
                }
                callback(error);
            });
        });
    }

    static readVersion() {
        return new Promise((resolve, reject) => {
            fs.readFile("./package.json", "utf-8", (err, jsonString) => {
                if (err) {
                    logger.error(err.message, { label: "UPDATE_READ_VERSION" });
                    return reject(err);
                }
                resolve(JSON.parse(jsonString).version);
            });
        });
    }
}
