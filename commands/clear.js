let Command = require('../src/Command');

module.exports = class Clear extends Command {
    static name = 'clear';
    static alias = [
        "clear",
        "clean"
    ];
    static description = "Nettoie le chat des commandes bot";

    static async call(message, phoenix) {
        let messages = message.channel.messages.filter(msg => msg.author.id === phoenix.bot.user.id || msg.content.startsWith(phoenix.config.prefix));
        for(let msg of messages) {
            await this.sleep(1000);
            msg[1].delete().catch(err => {
                console.error(err);
            })
        }
    }

    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
