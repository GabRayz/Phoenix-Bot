let Command = require("../src/Command");

module.exports = class Clear extends Command {
    static name = "clear";
    static alias = ["clear", "clean"];
    static description = "Nettoie le chat des commandes bot";

    static async call(message, phoenix) {
        let allMessage = await message.channel.messages.fetch();
        const prefix = phoenix.guilds[message.guildId].config.prefix;
        let botMessages = allMessage.filter(
            (msg) =>
                msg.author.id === phoenix.bot.user.id ||
                msg.content.startsWith(prefix)
        );
        for (let msg of botMessages) {
            msg[1].delete().catch((err) => {
                console.error(err);
            });
        }
    }

    static sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
};
