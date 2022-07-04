import Command from "../../Command";
import Play from "./play";
import logger from "../../logger";

export default class Volume extends Command {
    static commandName = "volume";
    static alias = ["volume"];
    static description = "Changer le volume";

    static call(msg: any, phoenix) {
        if (msg.args.length <= 0) {
            phoenix.sendClean(
                "Volume actuel: " + Play.volume * 100,
                msg.channel,
                5000
            );
            return;
        }
        let volume = msg.args[0];
        if (Play.voiceHandler && !Play.voiceHandler.paused) {
            if (volume >= 0 && volume <= 200) {
                Play.voiceHandler.setVolume(volume / 100);
                Play.volume = volume / 100;
                logger.debug("Volume set", { label: "VOLUME" });
            } else {
                phoenix.sendClean(
                    "Le volume doit etre compris entre 0 et 200.",
                    msg.channel,
                    5000
                );
            }
        } else {
            phoenix.sendClean(
                "Le bot ne joue pas, ou alors est en pause.",
                msg.channel,
                5000
            );
        }
    }
}
